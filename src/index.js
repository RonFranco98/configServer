import React from "react";
import ReactDOM from "react-dom";
import App from "./Component/App";
import { Auth0Provider } from "@auth0/auth0-react";

var Auth0_ClientID = "classified";
var Auth0_Domain = "classified";

ReactDOM.render(
      <App />
, document.getElementById("root"));