import React, { Component } from "react";
import ReactDOM from "react-dom";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ActivityCard from "./ActivityCard";

// Activity File Imports
import * as CapacityTalk from "../activitydata/CapacityTalk.json";
import * as HundredsActivity from "../activitydata/hundredsgrid/buildingnumbers/building_numbers_data.js"
import * as JellyBeanActivity from "../activitydata/fractionline/jellybean/jelly_bean_data.js"

class ActivityList extends Component {
  constructor(props) {
    super(props);
  }

  render() {
  
    return (
      <div className = "container">
        <div className ="section no-pad-bot" id="index-banner">
          <div className ="container">
            <h1 className ="header center grey-text">Activities</h1>
          </div>
        </div>
        <div className="row">
        <div className="col s6">
          <ActivityCard data={HundredsActivity.ACTIVITY} />
          </div>
          <div className="col s6">
          <ActivityCard data={JellyBeanActivity.ACTIVITY} />
          </div>
          </div>
      </div>
    );
  }
}

export default ActivityList;
