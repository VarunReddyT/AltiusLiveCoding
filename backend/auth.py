import jwt
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import create_access_token

def check_authentication(auth_header, role):
    token = None
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        
    decoded_token = jwt.decode(token)
    
    if decoded_token.role != role:
        return False
    
    return True

def get_new_token():
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity, fresh=False)
    return access_token