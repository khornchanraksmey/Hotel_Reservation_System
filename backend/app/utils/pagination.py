import math


def paginate(items: list, total: int, page: int, page_size: int) -> dict:
    total_pages = math.ceil(total / page_size) if page_size > 0 else 0
    return {
        "data": items,
        "total": total,
        "page": page,
        "per_page": page_size,
        "total_pages": total_pages,
    }


def get_offset(page: int, page_size: int) -> int:
    return (page - 1) * page_size
