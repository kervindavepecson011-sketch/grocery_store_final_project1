import sqlite3
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing for API requests

DB_NAME = "grocery_store.db"

def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Units of Measure Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS uom (
            uom_id INTEGER PRIMARY KEY AUTOINCREMENT,
            uom_name TEXT NOT NULL
        )
    ''')
    
    # 2. Products Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS products (
            product_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            uom_id INTEGER NOT NULL,
            price_per_unit REAL NOT NULL,
            FOREIGN KEY (uom_id) REFERENCES uom (uom_id)
        )
    ''')
    
    # 3. Orders Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS orders (
            order_id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT NOT NULL,
            total REAL NOT NULL,
            datetime TEXT NOT NULL
        )
    ''')
    
    # 4. Order Details Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS order_details (
            order_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity REAL NOT NULL,
            total_price REAL NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders (order_id),
            FOREIGN KEY (product_id) REFERENCES products (product_id)
        )
    ''')
    
    # Insert default Units of Measure if table is empty
    cursor.execute("SELECT COUNT(*) FROM uom")
    if cursor.fetchone()[0] == 0:
        cursor.executemany("INSERT INTO uom (uom_name) VALUES (?)", [('kg',), ('each',), ('liter',), ('pack',)])
        
    conn.commit()
    conn.close()

# Initialise database on startup
init_db()

# --- API ENDPOINTS ---

@app.route('/getUOM', methods=['GET'])
def get_uom():
    conn = get_db_connection()
    uom_list = conn.execute('SELECT * FROM uom').fetchall()
    conn.close()
    return jsonify([dict(row) for row in uom_list])

@app.route('/getProducts', methods=['GET'])
def get_products():
    conn = get_db_connection()
    query = '''
        SELECT p.product_id, p.name, p.price_per_unit, p.uom_id, u.uom_name 
        FROM products p 
        JOIN uom u ON p.uom_id = u.uom_id
    '''
    products = conn.execute(query).fetchall()
    conn.close()
    return jsonify([dict(p) for p in products])

@app.route('/insertProduct', methods=['POST'])
def insert_product():
    data = request.get_json()
    name = data.get('name')
    uom_id = data.get('uom_id')
    price_per_unit = data.get('price_per_unit')

    if not name or not uom_id or not price_per_unit:
        return jsonify({'error': 'Missing required product fields'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        'INSERT INTO products (name, uom_id, price_per_unit) VALUES (?, ?, ?)',
        (name, uom_id, float(price_per_unit))
    )
    conn.commit()
    product_id = cursor.lastrowid
    conn.close()

    return jsonify({'message': 'Product added successfully', 'product_id': product_id}), 201

@app.route('/deleteProduct', methods=['POST'])
def delete_product():
    data = request.get_json()
    product_id = data.get('product_id')

    if not product_id:
        return jsonify({'error': 'Product ID is required'}), 400

    conn = get_db_connection()
    conn.execute('DELETE FROM products WHERE product_id = ?', (product_id,))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Product deleted successfully'})

@app.route('/getAllOrders', methods=['GET'])
def get_all_orders():
    conn = get_db_connection()
    orders = conn.execute('SELECT * FROM orders ORDER BY order_id DESC').fetchall()
    
    result = []
    for order in orders:
        order_dict = dict(order)
        # Fetch order item details
        details_query = '''
            SELECT od.quantity, od.total_price, p.name, p.price_per_unit 
            FROM order_details od
            JOIN products p ON od.product_id = p.product_id
            WHERE od.order_id = ?
        '''
        items = conn.execute(details_query, (order['order_id'],)).fetchall()
        order_dict['items'] = [dict(item) for item in items]
        result.append(order_dict)

    conn.close()
    return jsonify(result)

@app.route('/insertOrder', methods=['POST'])
def insert_order():
    data = request.get_json()
    customer_name = data.get('customer_name', 'Guest')
    grand_total = data.get('grand_total')
    items = data.get('order_details', [])

    if not items or grand_total is None:
        return jsonify({'error': 'Invalid order data'}), 400

    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    conn = get_db_connection()
    cursor = conn.cursor()

    # Insert into main orders table
    cursor.execute(
        'INSERT INTO orders (customer_name, total, datetime) VALUES (?, ?, ?)',
        (customer_name, float(grand_total), now_str)
    )
    order_id = cursor.lastrowid

    # Insert order line items
    for item in items:
        cursor.execute(
            'INSERT INTO order_details (order_id, product_id, quantity, total_price) VALUES (?, ?, ?, ?)',
            (order_id, item['product_id'], item['quantity'], item['total_price'])
        )

    conn.commit()
    conn.close()

    return jsonify({'message': 'Order placed successfully', 'order_id': order_id}), 201

@app.route('/deleteOrder', methods=['POST'])
def delete_order():
    data = request.get_json()
    order_id = data.get('order_id')

    if not order_id:
        return jsonify({'error': 'Order ID required'}), 400

    conn = get_db_connection()
    conn.execute('DELETE FROM order_details WHERE order_id = ?', (order_id,))
    conn.execute('DELETE FROM orders WHERE order_id = ?', (order_id,))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Order deleted successfully'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)