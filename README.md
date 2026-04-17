# 🚗 Vehicle Repair Management System

[![Django](https://img.shields.io/badge/Django-4.2.7-green.svg)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tests](https://img.shields.io/badge/Tests-47%20passing-brightgreen.svg)](https://github.com/)
[![Coverage](https://img.shields.io/badge/Coverage-92%25-success.svg)](https://github.com/)

A **full-stack vehicle repair management system** built with Django REST Framework and React. Streamline component registration, vehicle tracking, repair orders, payment processing, and revenue analytics.

## ✨ Features

### Core Features (All Requirements Met)
- ✅ **Component Registration** - Register components with purchase/repair pricing
- ✅ **Vehicle Management** - Track customer vehicles with complete details
- ✅ **Issue Reporting** - Create repair orders with detailed issue descriptions
- ✅ **Component Selection** - Choose between repair service or purchase new component
- ✅ **Price Calculation** - Automatic total calculation (unit_price × quantity + labor_cost)
- ✅ **Payment Simulation** - Process payments with amount validation
- ✅ **Revenue Graphs** - Interactive charts (Daily/Monthly/Yearly) using Recharts

### Bonus Features
- ✅ **Unit Tests** - 47+ tests covering models, views, serializers, and APIs
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile
- ✅ **RESTful API** - Full CRUD operations with proper HTTP status codes
- ✅ **Admin Dashboard** - Django admin interface for data management

## 🛠️ Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Backend** | Django | 4.2.7 |
| **API** | Django REST Framework | 3.14.0 |
| **Frontend** | React | 18.2.0 |
| **Charts** | Recharts | 2.9.3 |
| **HTTP Client** | Axios | 1.6.0 |
| **Notifications** | React Hot Toast | 2.4.1 |
| **Database** | SQLite (Development) / PostgreSQL (Production) | - |
| **Testing** | Django Test Case / React Testing Library | - |


## Demo Video 

/repair-management-system/demo-video

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Python** 3.8 or higher
- **Node.js** 14.0 or higher
- **npm** 6.0 or higher (comes with Node.js)
- **Git** (optional, for cloning)

## 🚀 Quick Start (5 Minutes)

### Step 1: Clone or Download

# Clone the repository
git clone https://github.com/akhilmohan123/Vehicle-Service-Management-System.git
cd repair-management-system

# Or download and extract the ZIP file


# Navigate to backend directory
cd backend

cd api-backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

#Navigate to project folder

cd backend

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional, for admin access)
python manage.py createsuperuser

# Start backend server
python manage.py runserver

--------------------------------------------------------------------------
# Navigate to frontend directory
cd repair-management-system
cd frontend

# Install dependencies
npm install

# Start frontend server
npm start


--------------------------------------------------
# Testing

cd repair-management-system
cd backend
cd api-backend
# Activate the virtual environment
cd venv/Scripts
./activate

# Move back to backend folder
cd ..
cd ..
cd backend

python manage.py test