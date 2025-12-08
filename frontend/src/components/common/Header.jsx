import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../../store/slices/authSlice";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  HomeIcon,
  UserIcon,
  CalendarIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  const userNavigation = [
    { name: "My Bookings", href: "/bookings", icon: CalendarIcon },
    { name: "Profile", href: "/profile", icon: UserIcon },
    // Only show admin panel for admin users
    ...(user?.role === "admin"
      ? [{ name: "Admin Panel", href: "/admin", icon: Cog6ToothIcon }]
      : []),
  ];

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">
                EventBook
              </span>
            </Link>
            <nav className="hidden md:ml-10 md:flex md:space-x-8">
              <Link
                to="/"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Home
              </Link>
              <Link
                to="/services"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Services
              </Link>
              {user && (
                <>
                  <Link
                    to="/bookings"
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Bookings
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Admin
                    </Link>
                  )}
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <Menu as="div" className="relative inline-block text-left">
                  <Menu.Button className="flex items-center space-x-2 bg-gray-100 rounded-full p-1 hover:bg-gray-200 transition">
                    <div className="h-8 w-8 bg-primary-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden md:inline text-sm font-medium text-gray-700">
                      {user.name}
                    </span>
                  </Menu.Button>

                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items
                      className="absolute right-0 mt-2 w-56 origin-top-right bg-white z-50 
                 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                    >
                      {/* User Info */}
                      <div className="px-4 py-3 border-b">
                        <p className="text-sm font-medium text-gray-900">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                        {/* Show role badge */}
                        <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role === 'admin' ? 'Administrator' : 'User'}
                        </span>
                      </div>

                      {/* Menu Items */}
                      {userNavigation.map((item) => (
                        <Menu.Item key={item.name}>
                          {({ active }) => (
                            <Link
                              to={item.href}
                              className={`${
                                active ? "bg-gray-100" : ""
                              } flex items-center px-4 py-2 text-sm text-gray-700`}
                            >
                              <item.icon className="h-5 w-5 mr-3" />
                              {item.name}
                            </Link>
                          )}
                        </Menu.Item>
                      ))}

                      {/* Logout */}
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogout}
                            className={`${
                              active ? "bg-gray-100" : ""
                            } w-full flex items-center px-4 py-2 text-sm text-red-600`}
                          >
                            <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                            Sign out
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;