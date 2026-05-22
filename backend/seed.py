"""
Seed the database with initial data.
Run with:  uv run python seed.py
"""
import asyncio
from datetime import datetime, timezone, timedelta
from app.database import AsyncSessionLocal, engine, Base
from app.models.user import User, UserRole
from app.models.room_type import RoomType
from app.models.amenity import Amenity
from app.models.room import Room, RoomAmenity, RoomStatus
from app.models.promotion import Promotion
from app.utils.security import hash_password


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # ── Users ──
        admin = User(first_name="Admin", last_name="User", email="admin@hotel.com",
                     hashed_password=hash_password("Admin@123"), role=UserRole.admin,
                     is_active=True, is_verified=True)
        guest = User(first_name="John", last_name="Doe", email="guest@hotel.com",
                     hashed_password=hash_password("Guest@123"), role=UserRole.guest,
                     is_active=True, is_verified=True, phone="+1-555-0100")
        db.add_all([admin, guest])
        await db.flush()

        # ── Room Types ──
        types = [
            RoomType(name="Standard",  description="Comfortable standard room",                 base_price=99.00,  capacity=2),
            RoomType(name="Deluxe",    description="Spacious deluxe room with city view",       base_price=149.00, capacity=2),
            RoomType(name="Suite",     description="Luxurious suite with separate living area", base_price=249.00, capacity=4),
            RoomType(name="Family",    description="Large family room with extra beds",         base_price=179.00, capacity=6),
            RoomType(name="Penthouse", description="Top-floor penthouse with panoramic views",  base_price=499.00, capacity=4),
        ]
        db.add_all(types)
        await db.flush()

        # ── Amenities ──
        amenities = [
            Amenity(name="Free WiFi",        icon="wifi"),
            Amenity(name="Air Conditioning", icon="wind"),
            Amenity(name="Flat-screen TV",   icon="tv"),
            Amenity(name="Mini Bar",         icon="glass"),
            Amenity(name="Room Service",     icon="bell"),
            Amenity(name="Safe Box",         icon="lock"),
            Amenity(name="Balcony",          icon="sun"),
            Amenity(name="Jacuzzi",          icon="droplet"),
            Amenity(name="King Bed",         icon="bed"),
            Amenity(name="Ocean View",       icon="waves"),
        ]
        db.add_all(amenities)
        await db.flush()

        # ── Rooms ──
        rooms_data = [
            ("101", 0, 1, 99.00),  ("102", 0, 1, 99.00),  ("103", 0, 1, 99.00),
            ("201", 1, 2, 149.00), ("202", 1, 2, 149.00),
            ("301", 2, 3, 249.00), ("302", 2, 3, 249.00),
            ("401", 3, 4, 179.00), ("402", 3, 4, 179.00),
            ("501", 4, 5, 499.00),
        ]
        rooms = []
        for num, ti, fl, price in rooms_data:
            r = Room(room_number=num, room_type_id=types[ti].id, floor=fl,
                     price_per_night=price, status=RoomStatus.available, size_sqft=300 + fl * 50)
            db.add(r)
            rooms.append(r)
        await db.flush()

        # Add WiFi + AC + TV to all rooms
        for room in rooms:
            for am in amenities[:3]:
                db.add(RoomAmenity(room_id=room.id, amenity_id=am.id))
        # Extra amenities for Suites
        for room in rooms[5:7]:
            db.add(RoomAmenity(room_id=room.id, amenity_id=amenities[3].id))
            db.add(RoomAmenity(room_id=room.id, amenity_id=amenities[7].id))
        # All amenities for Penthouse
        for am in amenities[3:]:
            db.add(RoomAmenity(room_id=rooms[9].id, amenity_id=am.id))

        # ── Promotions ──
        now = datetime.now(timezone.utc)
        db.add_all([
            Promotion(code="WELCOME10", description="Welcome discount", discount_percent=10.0,
                      valid_from=now - timedelta(days=1), valid_until=now + timedelta(days=30), is_active=True),
            Promotion(code="SUMMER20",  description="Summer special 20% off", discount_percent=20.0,
                      valid_from=now - timedelta(days=1), valid_until=now + timedelta(days=60), is_active=True),
            Promotion(code="VIP30",     description="VIP exclusive 30% off", discount_percent=30.0,
                      valid_from=now - timedelta(days=1), valid_until=now + timedelta(days=90), is_active=True, usage_limit=50),
        ])
        await db.commit()

    print("✅ Database seeded!")
    print("   admin@hotel.com  /  Admin@123")
    print("   guest@hotel.com  /  Guest@123")
    print("   Promo codes: WELCOME10, SUMMER20, VIP30")


if __name__ == "__main__":
    asyncio.run(seed())
