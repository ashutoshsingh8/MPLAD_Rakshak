"""
MPLAD Rakshak — User Creation CLI Utility
==========================================
Script to provision new official user accounts (Ministry Admin, MP, District Authority, Contractor)
with bcrypt-hashed passwords in the MySQL database.

Usage examples:
--------------
Interactive mode:
  docker exec -it mplad_backend python create_user.py

Command-line arguments:
  docker exec mplad_backend python create_user.py --username mp_varanasi --password secret123 --name "Shri Narendra Modi" --role MP --district Varanasi --state "Uttar Pradesh" --email mp.varanasi@sansad.nic.in
"""

import sys
import argparse
import bcrypt
from sqlalchemy.orm import Session

from database import SessionLocal, engine
from models import User, UserRole, Base

def hash_password(password: str) -> str:
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")

def create_user(username, password, full_name, role_str, district=None, state=None, email=None):
    # Validate role
    role_map = {
        "MINISTRY_ADMIN": UserRole.MINISTRY_ADMIN,
        "MP": UserRole.MP,
        "DISTRICT_AUTHORITY": UserRole.DISTRICT_AUTHORITY,
        "CONTRACTOR": UserRole.CONTRACTOR,
    }
    
    clean_role = role_str.strip().upper()
    if clean_role not in role_map:
        print(f"❌ Error: Invalid role '{role_str}'. Choose from: {list(role_map.keys())}")
        return False

    db: Session = SessionLocal()
    try:
        # Check if username already exists
        existing = db.query(User).filter(User.username == username.strip()).first()
        if existing:
            print(f"⚠️ Warning: User with username '{username}' already exists (ID: {existing.id}, Name: {existing.full_name}).")
            choice = input("Do you want to update this user's password and profile? (y/N): ").strip().lower()
            if choice == 'y':
                existing.password_hash = hash_password(password)
                existing.full_name = full_name
                existing.role = role_map[clean_role]
                existing.district = district
                existing.state = state
                existing.email = email
                db.commit()
                print(f"✅ Successfully updated user '{username}'.")
                return True
            else:
                print("Cancelled.")
                return False

        # Create new user
        new_user = User(
            username=username.strip(),
            password_hash=hash_password(password),
            full_name=full_name.strip(),
            role=role_map[clean_role],
            district=district.strip() if district else None,
            state=state.strip() if state else None,
            email=email.strip() if email else None,
            is_active=True
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        print(f"\n🎉 User created successfully!")
        print(f"   • ID: {new_user.id}")
        print(f"   • Username: {new_user.username}")
        print(f"   • Role: {new_user.role.value}")
        print(f"   • Name: {new_user.full_name}")
        print(f"   • Jurisdiction: {new_user.district or 'N/A'}, {new_user.state or 'N/A'}")
        print(f"   • Email: {new_user.email or 'N/A'}")
        return True
    except Exception as e:
        db.rollback()
        print(f"❌ Database error: {e}")
        return False
    finally:
        db.close()

def main():
    parser = argparse.ArgumentParser(description="Create or update official users for MPLAD Rakshak")
    parser.add_argument("--username", help="Unique username for login (e.g. mp_mumbai)")
    parser.add_argument("--password", help="Plaintext password (will be bcrypt hashed)")
    parser.add_argument("--name", help="Full name of officer / representative")
    parser.add_argument("--role", choices=["MINISTRY_ADMIN", "MP", "DISTRICT_AUTHORITY", "CONTRACTOR"], help="Role code")
    parser.add_argument("--district", help="District name (e.g. Pune, Varanasi)")
    parser.add_argument("--state", help="State name (e.g. Maharashtra, Uttar Pradesh)")
    parser.add_argument("--email", help="Official email address")

    args = parser.parse_args()

    if args.username and args.password and args.name and args.role:
        create_user(
            username=args.username,
            password=args.password,
            full_name=args.name,
            role_str=args.role,
            district=args.district,
            state=args.state,
            email=args.email
        )
    else:
        print("=" * 60)
        print("  MPLAD Rakshak — Interactive User Account Provisioning")
        print("=" * 60)
        username = input("Enter Username (e.g. mp_nagpur): ").strip()
        password = input("Enter Password (e.g. admin123): ").strip()
        full_name = input("Enter Full Name (e.g. Shri Nitin Gadkari): ").strip()
        print("\nAvailable Roles:")
        print("  1. MP                 (Member of Parliament)")
        print("  2. DISTRICT_AUTHORITY (District Magistrate / Collector)")
        print("  3. CONTRACTOR         (Empanelled Construction Agency)")
        print("  4. MINISTRY_ADMIN     (MoSPI National Administrator)")
        role_choice = input("Select Role (1-4 or name): ").strip()
        role_map = {
            "1": "MP",
            "2": "DISTRICT_AUTHORITY",
            "3": "CONTRACTOR",
            "4": "MINISTRY_ADMIN",
        }
        role_str = role_map.get(role_choice, role_choice.upper())
        district = input("Enter District (optional, press Enter to skip): ").strip() or None
        state = input("Enter State (optional, press Enter to skip): ").strip() or None
        email = input("Enter Email (optional, press Enter to skip): ").strip() or None

        create_user(username, password, full_name, role_str, district, state, email)

if __name__ == "__main__":
    main()
