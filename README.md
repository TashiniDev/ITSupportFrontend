# IT Support Frontend

A modern, responsive IT Support ticketing system frontend built with React, Tailwind CSS, and best practices for user experience, accessibility, and maintainability.

## Features
- User authentication (login, register, password reset)
- Role-based dashboards (Admin, Department Head, User)
- Toast notifications (success, error, info, loading)
- Password visibility toggles (eye icon)
- Responsive design and dark mode support
- Modular component structure
- Professional UI with Tailwind CSS

## Folder Structure
```
ITSupportFrontend/
├── public/                # Static assets and index.html
├── src/
│   ├── assets/            # Images and logos
│   ├── components/        # Reusable React components
│   ├── pages/             # Page-level components (Login, Dashboard, etc.)
│   ├── services/          # API and notification services
│   ├── styles/            # Custom CSS (e.g., toast styles)
│   └── utils/             # Utility functions and API config
├── .env                   # Environment variables (e.g., PORT)
├── package.json           # Project dependencies and scripts
├── tailwind.config.js     # Tailwind CSS configuration
├── postcss.config.js      # PostCSS configuration
└── README.md              # Project documentation
```

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm (v9+ recommended)

### Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/TashiniDev/ITSupportFrontend.git
   cd ITSupportFrontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```

### Running the App
- Start the development server (default port: 3001):
  ```sh
  npm start
  ```
- Build for production:
  ```sh
  npm run build
  ```

### Environment Variables
- The `.env` file sets the frontend port and API URL:
  ```env
  PORT=3001
  REACT_APP_API_URL=http://localhost:3000/api
  ```

## Main Components
- **LoginForm**: User login with password visibility toggle
- **RegisterForm**: User registration with password visibility toggle
- **ForgotPasswordModal**: Password reset request
- **ResetPasswordPage**: Set new password with visibility toggle
- **ToastProvider**: Global toast notification system
- **ThemeProvider**: Light/dark mode support
- **UserDashboard/AdminDashboard/DepartmentHeadDashboard**: Role-based dashboards
- **ImagePlaceholders**: Logo and illustration components

## Toast Notifications
- Powered by `react-toastify` with custom styles
- Usage examples in `TOAST_DOCUMENTATION.md`

## Customization
- Update styles in `src/styles/toast.css`
- Add/modify assets in `src/assets/`
- Extend components in `src/components/`

## Contributing
Pull requests and issues are welcome! Please follow best practices and keep code modular and readable.

## License
MIT

---
For more details and usage examples, see [TOAST_DOCUMENTATION.md](./TOAST_DOCUMENTATION.md).
