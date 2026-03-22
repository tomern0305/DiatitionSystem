"""User management routes — admin only."""

import bcrypt
from functools import wraps
from flask import Blueprint, request, jsonify
from models import db, User
from routes.auth import verify_token

users_bp = Blueprint('users', __name__)


def require_admin(f):
    """Decorator: requires a valid JWT with the 'admin' role."""
    @wraps(f)
    def wrapper(*args, **kwargs):
        payload = verify_token(request)
        if not payload:
            return jsonify({'error': 'לא מורשה'}), 401
        if payload.get('role') != 'admin':
            return jsonify({'error': 'גישה נדחתה'}), 403
        return f(*args, **kwargs)
    return wrapper


@users_bp.route('/api/users', methods=['GET'])
@require_admin
def get_users():
    """List all system users."""
    users = User.query.order_by(User.id).all()
    return jsonify([{
        'id': u.id,
        'username': u.username,
        'role': u.role,
        'must_change_password': u.must_change_password,
    } for u in users])


@users_bp.route('/api/users', methods=['POST'])
@require_admin
def create_user():
    """Create a new user with a hashed temp password."""
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    temp_password = data.get('tempPassword', '')
    role = data.get('role', 'lineworker')

    if not username or not temp_password:
        return jsonify({'error': 'שדות חסרים'}), 400
    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'שם משתמש כבר קיים'}), 409

    password_hash = bcrypt.hashpw(temp_password.encode(), bcrypt.gensalt()).decode()
    user = User(username=username, password_hash=password_hash, role=role, must_change_password=True)
    db.session.add(user)
    db.session.commit()

    return jsonify({'id': user.id, 'username': user.username, 'role': user.role}), 201


@users_bp.route('/api/users/<int:user_id>/role', methods=['PATCH'])
@require_admin
def update_role(user_id):
    """Update a user's role."""
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'משתמש לא נמצא'}), 404
    data = request.get_json() or {}
    user.role = data.get('role', user.role)
    db.session.commit()
    return jsonify({'id': user.id, 'role': user.role})


@users_bp.route('/api/users/<int:user_id>/reset-password', methods=['POST'])
@require_admin
def reset_password(user_id):
    """Reset a user's password to a new temp password and flag must_change_password."""
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'משתמש לא נמצא'}), 404
    data = request.get_json() or {}
    temp_password = data.get('tempPassword', '')
    if not temp_password:
        return jsonify({'error': 'סיסמה חסרה'}), 400

    user.password_hash = bcrypt.hashpw(temp_password.encode(), bcrypt.gensalt()).decode()
    user.must_change_password = True
    db.session.commit()
    return jsonify({'success': True})


@users_bp.route('/api/users/<int:user_id>', methods=['DELETE'])
@require_admin
def delete_user(user_id):
    """Delete a user."""
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'משתמש לא נמצא'}), 404
    db.session.delete(user)
    db.session.commit()
    return jsonify({'success': True})
