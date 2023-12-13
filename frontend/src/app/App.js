import React from 'react';
import '../App.css';
import Root from "./Root";

// import Posts from "../features/posts/Posts";

import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom';
// import {Comments} from "../features/comments/Comments";

const router = createBrowserRouter( createRoutesFromElements(
    <Route path="/" element={<Root />}>
        
    </Route>
))

export default function App() {
    return (
        <RouterProvider router={router}/>
    );
}

