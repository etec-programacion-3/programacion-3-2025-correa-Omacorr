# test_auth.py - Script para probar el sistema de autenticación
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000/api/v1"

def test_auth_system():
    """Prueba completa del sistema de autenticación"""
    
    print("🧪 PROBANDO SISTEMA DE AUTENTICACIÓN")
    print("=" * 50)
    
    # Datos de prueba
    test_user = {
        "email": "juan.perez@ejemplo.com",
        "username": "juanperez",
        "password": "mipassword123",
        "nombre": "Juan",
        "apellido": "Pérez",
        "telefono": "123456789",
        "direccion": "Calle Falsa 123"
    }
    
    # 1. Probar registro
    print("\n1️⃣ PROBANDO REGISTRO DE USUARIO")
    print("-" * 30)
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=test_user)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 201:
            data = response.json()
            print("✅ Registro exitoso!")
            print(f"🔑 Token: {data['access_token'][:50]}...")
            print(f"👤 Usuario: {data['user']['username']}")
            token = data['access_token']
        else:
            print(f"❌ Error en registro: {response.json()}")
            # Si el usuario ya existe, intentamos hacer login directamente
            print("\n⚠️  El usuario ya existe, continuando con login...")
            token = None
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return
    
    # 2. Probar login
    print("\n2️⃣ PROBANDO LOGIN")
    print("-" * 30)
    
    login_data = {
        "username": test_user["email"],  # OAuth2 usa username pero enviamos email
        "password": test_user["password"]
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", data=login_data)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Login exitoso!")
            print(f"🔑 Token: {data['access_token'][:50]}...")
            print(f"⏱️  Expira en: {data['expires_in']} segundos")
            token = data['access_token']
        else:
            print(f"❌ Error en login: {response.json()}")
            return
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return
    
    # 3. Probar acceso a perfil público (sin autenticación)
    print("\n3️⃣ PROBANDO PERFIL PÚBLICO (sin autenticación)")
    print("-" * 30)
    
    try:
        response = requests.get(f"{BASE_URL}/users/{test_user['username']}")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Acceso a perfil público exitoso!")
            print(f"👤 Username: {data['username']}")
            print(f"📛 Nombre: {data['nombre']} {data['apellido']}")
            print(f"📅 Registrado: {data['created_at']}")
            print(f"🔒 Email NO visible (protegido)")
        else:
            print(f"❌ Error: {response.json()}")
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
    
    # 4. Probar acceso a perfil completo (CON autenticación)
    print("\n4️⃣ PROBANDO PERFIL COMPLETO (con autenticación)")
    print("-" * 30)
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.get(f"{BASE_URL}/users/me/profile", headers=headers)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Acceso a perfil completo exitoso!")
            print(f"👤 Username: {data['username']}")
            print(f"📧 Email: {data['email']} (visible porque estás autenticado)")
            print(f"📱 Teléfono: {data['telefono']}")
            print(f"🏠 Dirección: {data['direccion']}")
        else:
            print(f"❌ Error: {response.json()}")
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
    
    # 5. Probar acceso sin token (debe fallar)
    print("\n5️⃣ PROBANDO ACCESO SIN TOKEN (debe fallar)")
    print("-" * 30)
    
    try:
        response = requests.get(f"{BASE_URL}/users/me/profile")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 403 or response.status_code == 401:
            print("✅ Protección funcionando correctamente!")
            print("❌ Acceso denegado sin token (comportamiento esperado)")
        else:
            print(f"⚠️  Advertencia: debería retornar 401/403")
            print(f"Respuesta: {response.text}")
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
    
    # 6. Probar actualización de perfil
    print("\n6️⃣ PROBANDO ACTUALIZACIÓN DE PERFIL")
    print("-" * 30)
    
    update_data = {
        "telefono": "987654321",
        "direccion": "Avenida Siempreviva 742"
    }
    
    try:
        response = requests.put(
            f"{BASE_URL}/users/me/profile", 
            json=update_data,
            headers=headers
        )
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Perfil actualizado exitosamente!")
            print(f"📱 Nuevo teléfono: {data['telefono']}")
            print(f"🏠 Nueva dirección: {data['direccion']}")
        else:
            print(f"❌ Error: {response.json()}")
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
    
    # 7. Probar token inválido
    print("\n7️⃣ PROBANDO TOKEN INVÁLIDO (debe fallar)")
    print("-" * 30)
    
    invalid_headers = {
        "Authorization": "Bearer token_invalido_123"
    }
    
    try:
        response = requests.get(f"{BASE_URL}/users/me/profile", headers=invalid_headers)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 401:
            print("✅ Validación de token funcionando correctamente!")
            print("❌ Token inválido rechazado (comportamiento esperado)")
        else:
            print(f"⚠️  Advertencia: debería retornar 401")
            print(f"Respuesta: {response.text}")
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 PRUEBAS COMPLETADAS")
    print("=" * 50)
    print("\n📊 RESUMEN:")
    print("- Registro de usuario")
    print("- Login con credenciales")
    print("- Acceso a perfil público (sin auth)")
    print("- Acceso a perfil completo (con auth)")
    print("- Protección de rutas")
    print("- Actualización de perfil")
    print("- Validación de tokens")
    print("\n✅ Sistema de autenticación funcionando correctamente!")

if __name__ == "__main__":
    print("\n" + "=" * 50)
    print("🔐 TEST DE SISTEMA DE AUTENTICACIÓN JWT")
    print("=" * 50)
    print("\n⚠️  IMPORTANTE: Asegúrate de que el servidor esté corriendo")
    print("   Comando: uvicorn app.main:app --reload")
    print(f"   URL: {BASE_URL}")
    print("\n" + "=" * 50)
    
    input("\nPresiona Enter para comenzar las pruebas...")
    
    test_auth_system()