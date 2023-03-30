import React from 'react'

import './App.scss';

import Container from 'react-bootstrap/Container';

import Header from './Header';
import Footer from './Footer';

import { Satellites, satellitesLoader } from './Satellites';
import Predictions from './Predictions';
import { Detail, detailLoader } from './Detail';
import { PassDetail, passDetailLoader } from './PassDetail';
import { Settings, SettingsProvider } from './Settings';
import { Outlet, createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import ErrorPage from './ErrorPage';

const queryClient = new QueryClient();

const router = createBrowserRouter([{
    path: "/",
    element: <Layout />,
    children: [{
        path: '/',
        loader: satellitesLoader,
        element: <Satellites />,
        errorElement: <ErrorPage />,
      }, {
        path: "/predictions",
        element: <Predictions />,
        errorElement: <ErrorPage />,
      }, {
        path: "/settings",
        element: <Settings />,
        errorElement: <ErrorPage />,
      }, {
        path: "/detail/:satid",
        loader: detailLoader,
        element: <Detail />,
        errorElement: <ErrorPage />,
      }, {
        path: "/pass/:satid/:range",
        loader: passDetailLoader,
        element: <PassDetail />,
        errorElement: <ErrorPage />,
      }
    ],
  },  
]);

const App = () => (
  <SettingsProvider>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </SettingsProvider>
)

function Layout() {
  return (
    <Container>
      <Header />
      <Outlet />
      <Footer />
    </Container>
  );
}

export default App;
