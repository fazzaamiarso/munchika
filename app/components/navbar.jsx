import {
  Link,
  useNavigate,
  useFetcher,
  useTransition,
  useLocation,
  NavLink,
} from 'remix';
import { Fragment, useEffect } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { MenuIcon, XIcon } from '@heroicons/react/outline';
import { UserCircleIcon } from '@heroicons/react/solid';
import Logo from '../images/MunchikaRed.svg';
import Munchika from '../images/LogoMunchika.svg';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Browse', href: '/search' },
];
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function Navbar() {
  const logout = useFetcher();
  const location = useLocation();
  const navigate = useNavigate();
  const handleAdd = () => navigate('/post/select');
  const transition = useTransition();

  useEffect(() => {
    if (transition.state === 'idle') logout.load('/navbarUser'); //check every route change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transition]);

  return (
    <header className="">
      <Disclosure as="nav" className="bg-gray-800">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
              <div className="relative flex h-16 items-center justify-between">
                <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                  {/* Mobile menu button*/}
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
                <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                  <div className="flex  items-center">
                    <img
                      className="block h-8 w-auto md:hidden"
                      src={Logo}
                      alt="Munchika"
                    />
                    <img
                      className="hidden h-8 w-auto md:block"
                      src={Munchika}
                      alt="Munchika"
                    />
                  </div>
                  <div className="hidden sm:ml-6 sm:block">
                    <div className="flex space-x-4">
                      {navigation.map(item => (
                        <NavLink
                          prefetch="intent"
                          key={item.name}
                          to={item.href}
                          className={({ isActive }) =>
                            classNames(
                              isActive ? 'bg-gray-900 text-white' : '',
                              'rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white',
                            )
                          }
                        >
                          {item.name}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center gap-4 pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                  <button
                    className="hidden rounded-sm bg-blue-400 py-1 px-3 text-sm font-semibold text-white hover:opacity-90 sm:block"
                    onClick={handleAdd}
                    disabled={
                      transition.state === 'submitting' ||
                      transition.state === 'loading'
                    }
                  >
                    Add Thought
                  </button>

                  {/* Profile dropdown */}
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <Menu.Button className="flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                        <span className="sr-only">Open user menu</span>
                        {logout.data ? (
                          <img
                            className="h-8 w-8 rounded-full"
                            src={logout.data.avatar_url}
                            alt={logout.data.username}
                          />
                        ) : (
                          <UserCircleIcon className="h-8 w-8 rounded-full text-gray-300" />
                        )}
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        {logout.data ? (
                          <>
                            <Menu.Item>
                              <Link
                                to="/user/posts"
                                className={classNames(
                                  'block px-4 py-2 text-sm text-gray-700',
                                )}
                              >
                                My Posts
                              </Link>
                            </Menu.Item>
                          </>
                        ) : null}
                        <Menu.Item>
                          {logout.data ? (
                            <logout.Form
                              action={`/logout?redirectTo=${location.pathname}`}
                              method="post"
                            >
                              <button
                                type="submit"
                                className="block w-full px-4 py-2 text-left text-sm text-gray-700"
                              >
                                Logout
                              </button>
                            </logout.Form>
                          ) : (
                            <Link
                              to={`/login?redirectTo=${location.pathname}`}
                              className={classNames(
                                'block px-4 py-2 text-sm text-gray-700',
                              )}
                            >
                              Login
                            </Link>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              </div>
            </div>

            <Disclosure.Panel className="sm:hidden">
              <div className="space-y-1 px-2 pt-2 pb-3">
                {navigation.map(item => (
                  <Disclosure.Button
                    key={item.name}
                    as={Link}
                    to={item.href}
                    className={classNames(
                      'text-gray-300 hover:bg-gray-700 hover:text-white',
                      'block rounded-md px-3 py-2 text-base font-medium',
                    )}
                  >
                    {item.name}
                  </Disclosure.Button>
                ))}
                <button
                  className="mx-3 my-2 mt-8 block rounded-sm bg-blue-400 py-1 px-3 text-sm font-semibold text-white "
                  onClick={handleAdd}
                >
                  Add Thought
                </button>
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </header>
  );
}

export { Navbar };
