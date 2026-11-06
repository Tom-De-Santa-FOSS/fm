#!/usr/bin/env python3
"""Manage D1 products and R2 WebP images with the authenticated cf CLI."""

import argparse
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile
from uuid import uuid4


ROOT = Path(__file__).resolve().parents[1]
DATABASE_CONFIG = json.loads((ROOT / "database.json").read_text())
DATABASE = DATABASE_CONFIG["databaseId"]
ACCOUNT = DATABASE_CONFIG["accountId"]
BUCKET = "freshmarket-images"
IMAGE_HOST = "https://images.freshmarketpakistan.com/"
UNITS = {"kg", "loaf", "bunch", "dozen", "250g", "500g"}


def run(*args):
    result = subprocess.run(args, text=True, capture_output=True, check=True)
    return result.stdout


FIELDS = ("name", "tag", "description", "image_url", "price_rs", "unit", "available", "ai_keywords", "selling_rule")
BOOLEAN_FIELDS = {"available"}
SELLING_RULES = {"standard", "variable_weight", "whole_kg_only"}
SELECT = "id, " + ", ".join(FIELDS)


def placeholder(field):
    return "CAST(? AS INTEGER)" if field in ("id", "price_rs") or field in BOOLEAN_FIELDS else "?"


def query(cf, sql, params=(), local=False):
    command = [cf, "d1", "raw", DATABASE, "--sql", sql]
    if params:
        command += ["--params", *(str(value) for value in params)]
    if local:
        state = Path(__file__).resolve().parents[1] / ".wrangler/state"
        command += ["--local", "--persist-to", str(state)]
    results = json.loads(run(*command))
    if not results or not results[0]["success"]:
        raise ValueError(f"D1 query failed: {results}")
    table = results[0]["results"]
    return [dict(zip(table["columns"], row, strict=True)) for row in table["rows"]]


def as_product(row):
    return {
        field: bool(value) if field in BOOLEAN_FIELDS else value
        for field, value in row.items()
    }


def product_data(data, creating):
    if not isinstance(data, dict):
        raise ValueError("Product data must be a JSON object")
    allowed = {"id", *FIELDS, "image"}
    unknown = set(data) - allowed
    if unknown:
        raise ValueError(f"Unknown product fields: {', '.join(sorted(unknown))}")
    if creating:
        missing = {"name", "tag", "description", "price_rs", "unit"} - set(data)
        if missing:
            raise ValueError(f"Missing product fields: {', '.join(sorted(missing))}")
        if "image" not in data and "image_url" not in data:
            raise ValueError("New products need an image or image_url")
    elif "id" in data:
        raise ValueError("Pass the product ID as a command argument, not in the update file")
    if not data:
        raise ValueError("Provide at least one field to update")
    for field in ("name", "tag", "description", "unit"):
        if field in data:
            if not isinstance(data[field], str) or not data[field].strip():
                raise ValueError(f"{field} must be a non-empty string")
            data[field] = data[field].strip()
    if len(data.get("name", "")) > 120 or len(data.get("description", "")) > 1000:
        raise ValueError("Name or description is too long")
    if len(data.get("tag", "")) > 120:
        raise ValueError("Tag is too long")
    if "unit" in data and data["unit"] not in UNITS:
        raise ValueError("Unsupported unit")
    if "price_rs" in data and (
        type(data["price_rs"]) is not int or not 0 < data["price_rs"] <= 1_000_000
    ):
        raise ValueError("price_rs must be a positive whole number")
    for field in BOOLEAN_FIELDS & data.keys():
        if type(data[field]) is not bool:
            raise ValueError(f"{field} must be true or false")
    if "selling_rule" in data and (
        not isinstance(data["selling_rule"], str) or data["selling_rule"] not in SELLING_RULES
    ):
        raise ValueError("Unsupported selling rule")
    if "ai_keywords" in data and (
        not isinstance(data["ai_keywords"], str) or len(data["ai_keywords"]) > 500
    ):
        raise ValueError("ai_keywords must be a string of at most 500 characters")
    if "id" in data and (type(data["id"]) is not int or data["id"] <= 0):
        raise ValueError("id must be a positive integer")
    if "image" in data and (not isinstance(data["image"], str) or not data["image"].strip()):
        raise ValueError("image must be a file path")
    if "image" in data and "image_url" in data:
        raise ValueError("Provide image or image_url, not both")
    if "image_url" in data and (
        not isinstance(data["image_url"], str)
        or not re.fullmatch(
            r"https://images\.freshmarketpakistan\.com/[a-zA-Z0-9/_-]+\.webp",
            data["image_url"],
        )
    ):
        raise ValueError("image_url must be a WebP URL on the catalog image domain")
    return data


def tag_name(name):
    name = name.strip()
    if not name or len(name) > 120:
        raise ValueError("Tag name must be 1–120 characters")
    return name


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    for name in ("list", "get", "create", "update", "delete"):
        command = commands.add_parser(name)
        command.add_argument("--local", action="store_true", help="Use local D1")
        if name in ("get", "update", "delete"):
            command.add_argument("id", type=int)
        if name in ("create", "update"):
            command.add_argument("product", type=Path, help="JSON file with product fields")
            command.add_argument("--dry-run", action="store_true", help="Preview without writing")
        if name == "delete":
            command.add_argument("--yes", action="store_true", help="Confirm permanent deletion")
    tag_command = commands.add_parser("tags", help="Manage storefront tags")
    tag_command.add_argument("--local", action="store_true", help="Use local D1")
    tag_commands = tag_command.add_subparsers(dest="tag_command", required=True)
    for name in ("list", "create", "update", "delete"):
        command = tag_commands.add_parser(name)
        if name != "list":
            command.add_argument("name")
        if name == "update":
            command.add_argument("new_name")
        if name == "delete":
            command.add_argument("--yes", action="store_true", help="Confirm deletion")
    args = parser.parse_args()
    cf = str(Path(__file__).resolve().parents[1] / "node_modules/.bin/cf")
    if not Path(cf).is_file():
        raise ValueError("Install project dependencies before managing products")
    if os.environ.get("CLOUDFLARE_ACCOUNT_ID", ACCOUNT) != ACCOUNT:
        raise ValueError("CLOUDFLARE_ACCOUNT_ID differs from database.json")
    os.environ["CLOUDFLARE_ACCOUNT_ID"] = ACCOUNT

    if args.command == "tags":
        if args.tag_command == "list":
            rows = query(cf, "SELECT name, position FROM tags ORDER BY position, name", local=args.local)
            print(json.dumps(rows))
            return
        # Existing names may predate the operator's naming rules; look them up exactly.
        name = tag_name(args.name) if args.tag_command == "create" else args.name
        if args.tag_command == "create":
            rows = query(
                cf,
                "INSERT INTO tags (name, position) VALUES (?, (SELECT COALESCE(MAX(position), 0) + 1 FROM tags)) RETURNING name, position",
                [name], args.local,
            )
        elif args.tag_command == "update":
            new_name = tag_name(args.new_name)
            rows = query(
                cf, "UPDATE tags SET name = ? WHERE name = ? RETURNING name, position",
                [new_name, name], args.local,
            )
        else:
            if not args.yes:
                raise ValueError(f"Refusing to delete tag {name} without --yes")
            if query(cf, "SELECT id FROM products WHERE tag = ? LIMIT 1", [name], args.local):
                raise ValueError(f"Tag {name} has products; reassign them before deleting it")
            rows = query(cf, "DELETE FROM tags WHERE name = ? RETURNING name", [name], args.local)
        if not rows:
            raise ValueError(f"Tag {name} does not exist")
        print(json.dumps(rows[0]))
        return

    if args.command == "list":
        rows = query(cf, f"SELECT {SELECT} FROM products ORDER BY id", local=args.local)
        print(json.dumps([as_product(row) for row in rows]))
        return

    old = None
    if args.command in ("get", "update", "delete"):
        if args.id <= 0:
            raise ValueError("Product ID must be positive")
        rows = query(cf, f"SELECT {SELECT} FROM products WHERE id = ?", [args.id], args.local)
        if not rows:
            raise ValueError(f"Product {args.id} does not exist")
        old = rows[0]
    if args.command == "get":
        print(json.dumps(as_product(old)))
        return
    if args.command == "delete":
        if not args.yes:
            raise ValueError(f"Refusing to delete {args.id} ({old['name']}) without --yes")
        rows = query(cf, "DELETE FROM products WHERE id = ? RETURNING id", [args.id], args.local)
        if not rows:
            raise ValueError("Product changed before deletion completed")
        print(json.dumps({"deleted": rows[0]["id"]}))
        return

    data = product_data(json.loads(args.product.read_text()), args.command == "create")
    if "tag" in data and not query(
        cf, "SELECT name FROM tags WHERE name = ?", [data["tag"]], args.local
    ):
        raise ValueError(f"Tag {data['tag']} does not exist; create it first")
    selling_rules = {**(old or {}), **data}
    if selling_rules.get("selling_rule", "standard") != "standard" and selling_rules["unit"] != "kg":
        raise ValueError("Weight-based selling rules require a kg unit")
    image = (args.product.parent / data["image"]).resolve() if data.get("image") else None
    if args.local and image:
        raise ValueError("Photo uploads require production D1; --local cannot publish images")
    if image and (not image.is_file() or image.stat().st_size > 20_000_000):
        raise ValueError("Image must be a file smaller than 20 MB")

    if args.dry_run:
        print(json.dumps({
            "action": args.command,
            "product": args.id if old else data["name"],
            "database": "local" if args.local else "production",
            "image_upload": str(image) if image else None,
        }))
        return

    if image:
        name = data.get("name", old["name"] if old else "product")
        key = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-") or "product"
        key = f"{key}-{uuid4().hex[:12]}.webp"
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / key
            run("magick", str(image), "-auto-orient", "-resize", "1200x1200>",
                "-strip", "-quality", "78", "-define", "webp:method=6", str(output))
            if not output.is_file() or not output.stat().st_size:
                raise ValueError("Image conversion failed")
            run(cf, "r2", "objects", "put", key, "--bucket-name", BUCKET,
                "--file", str(output), "--content-type", "image/webp")
        data["image_url"] = IMAGE_HOST + key

    values = {field: data[field] for field in FIELDS if field in data}
    if args.command == "create":
        values.setdefault("available", True)
        values.setdefault("ai_keywords", "")
        values.setdefault("selling_rule", "standard")
    values = {
        field: int(value) if field in BOOLEAN_FIELDS else value
        for field, value in values.items()
    }
    columns = (["id"] if "id" in data else []) + list(values)
    parameters = ([data["id"]] if "id" in data else []) + list(values.values())
    if args.command == "update":
        columns = list(values)
        parameters = list(values.values()) + [args.id]
        assignments = ", ".join(f"{field} = {placeholder(field)}" for field in columns)
        sql = f"UPDATE products SET {assignments} WHERE id = CAST(? AS INTEGER) RETURNING {SELECT}"
    else:
        sql = (f"INSERT INTO products ({', '.join(columns)}) VALUES (" +
               ", ".join(placeholder(field) for field in columns) + ") RETURNING " + SELECT)
    rows = query(cf, sql, parameters, args.local)
    if not rows:
        raise ValueError("Product changed before the write completed")
    print(json.dumps(as_product(rows[0])))


if __name__ == "__main__":
    try:
        main()
    except (ValueError, OSError, subprocess.CalledProcessError, json.JSONDecodeError) as error:
        message = error.stderr.strip() if isinstance(error, subprocess.CalledProcessError) else error
        print(message, file=sys.stderr)
        sys.exit(1)
