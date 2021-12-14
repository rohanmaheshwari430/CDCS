import React from 'react';
import './App.css';
import Dashboard from "./dashboard/Dashboard";
import {BrowserRouter as Router, Route, Link, Routes} from "react-router-dom";
import View from "./view-chat-logs/View";
import { PageHeader} from "antd";


function App() {
  return (
      <div>
          <div>
              <PageHeader
                  className="site-page-header"
                  title="Home Depot Delivery Management Portal"
                  subTitle="Orders"
              />
          </div>
          <Router>
              <div>
                  <Routes>
                      <Route path="/" element={<Dashboard/>}>
                      </Route>
                      <Route path="/view/:id" element={<View/>}>
                      </Route>
                  </Routes>
              </div>
          </Router>
      </div>

    // <div className="App">
    //     Home Depot Header Component
    //     <Dashboard/>
    // </div>
  );
}

export default App;
