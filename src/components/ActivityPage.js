import React, { Component } from "react";
import ReactDOM from "react-dom";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import logo from "./logo.svg";
import "./App.css";
import "./materialize.css";
import { makeStyles } from "@material-ui/core/styles";
//import "materialize-css/dist/css/materialize.min.css";
import { Switch, Route, Link } from "react-router-dom";

import WhiteboardImage from "../src/assets/WhiteboardCardImage.jpg";
import MultiplicationImage from "../src/assets/MultiplicationCardImage.jpg";
import FaceIcon from "@material-ui/icons/Face";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import GroupIcon from "@material-ui/icons/Group";
import ForumIcon from "@material-ui/icons/Forum";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import AppBar from "@material-ui/core/AppBar";
import Divider from "@material-ui/core/Divider";

import AgendaItem from "./AgendaItem";
import ActivityItem from "./ActivityItem";

class ActivityPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tabIndex: 0
    };
  }

  changeTab(event, newValue) {
    console.log("this is what's passed", newValue);
    this.setState({ tabIndex: newValue });
  }

  render() {
    return (
      <div className="row">
        <Typography variant="h5" className="center">
          {this.props.data.TITLE}
        </Typography>
        <br />
        <Divider />
        <br />
        <div className="center">
          <Button variant="outlined" color="primary">
            Hello
          </Button>
        </div>
      </div>
    );
  }
}

export default ActivityPage
