import React from "react";
import PropTypes from "prop-types";
import SwipeableViews from "react-swipeable-views";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Arena from "./Arena";
import * as FractionWallScript from "../js/fractionwall.js";
import * as NumberLineToolScript from "../js/numberlinetool.js";
import * as GridToolScript from "../js/gridtool.js";
import * as OrderingToolScript from "../js/orderingtool.js";
import * as SharingToolScript from "../js/sharingtool.js";
import * as HundredsArrayScript from "../js/hundredsarray.js";
import * as NumberStripsScript from "../js/numberlinestrips.js";
import * as CuisenaireToolScript from "../js/cuisenairetool.js";
import * as FractionStacksScript from "../js/fractionstacks.js";
import FactorBlocks from "./FactorBlocks";
import * as CapacityTalkData from "../activitydata/CapacityTalk.json";
import * as Pixi from "pixi.js";
import { TweenMax, TimelineLite, Power2, Elastic, CSSPlugin, TweenLite, TimelineMax } from "gsap/TweenMax";



function TabContainer({ children, dir }) {
  return (
    <div component="div" dir={dir}>
      {children}
    </div>
  );
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
  dir: PropTypes.string.isRequired
};

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    width: 500
  }
}));

Pixi.settings.RESOLUTION = 3
var globalApp = new Pixi.Application(0,0,{backgroundColor: 0xffffff,antialias: true});

var arenaOne

export default function ManipulativeCarousel(props) {

  const classes = useStyles();
  const theme = useTheme();
  const app = globalApp
  const [value, setValue] = React.useState(0);

 
  app.help = ()=> {    
    console.log("animating",arenaOne.style)
    var tl = new TimelineMax()
    tl.to(arenaOne, 0.5, {x: arenaOne.clientWidth,alpha: 0})
      .to(arenaOne,0, {x: -arenaOne.clientWidth,alpha: 1})
      .to(arenaOne,1,{x: 0})
    }

  function handleChange(event, newValue) {
    setValue(newValue);
  }

  function handleChangeIndex(index) {
    setValue(index);
  }

  return (
    <div className="container">
        <div className="section no-pad-bot" id="index-banner">
        <div className="container">
          <h1 className="header center grey-text">Manipulatives</h1>
        </div>
      </div>
      <Tabs
        value={value}
        onChange={handleChange}
        indicatorColor="primary"
        textColor="primary"
        variant="scrollable"
      >
        <Tab className = "white" label="Number Strips" />
        <Tab className = "white" label="Hundreds Grid" />
        <Tab className = "white" label="Number Line" />
        <Tab className = "white" label="Fraction Wall" />
        <Tab className = "white" label="Grid Tool" />
        <Tab className = "white" label="Ordering Tool" />
        <Tab className = "white" label="Sharing Tool" />
        <Tab className = "white" label="Cuisenaire" />
        <Tab className = "white" label="Factor Wall" />
        <Tab className = "white" label="Fraction Stacks" />
      </Tabs>

      <SwipeableViews
        axis={theme.direction === "rtl" ? "x-reverse" : "x"}
        index={value}
        onChangeIndex={handleChangeIndex}
      >
        <TabContainer dir={theme.direction}>
          {value == 0 && (
            <div ref = {me=> arenaOne = me}>
            <Arena
              app = {app}
              lesson = {CapacityTalkData.default}
              setup={false}
              fullscreen={true}
              script={NumberStripsScript.init}
            />
            </div>
          )}
        </TabContainer>
        <TabContainer dir={theme.direction}>
          {value == 1 && (
            <Arena
             app = {app}
              lesson = {CapacityTalkData.default}
              setup={false}
              fullscreen={true}
              script={HundredsArrayScript.init}
            />
           )}
        </TabContainer>
        <TabContainer dir={theme.direction}>
          {value == 2 && (
            <div ref = {me=> arenaOne = me}>
            <Arena
              app = {app}
              lesson = {CapacityTalkData.default}
              setup={false}
              fullscreen={true}
              script={NumberLineToolScript.init}
            />
            </div>
          )}
        </TabContainer>
        <TabContainer dir={theme.direction}>
          {value == 3 && (
            <Arena
             app = {app}
              lesson = {CapacityTalkData.default}
              setup={false}
              fullscreen={true}
              script={FractionWallScript.init}
            />
           )}
        </TabContainer>
        <TabContainer dir={theme.direction}>
          {value == 4 && (
            <Arena
              app = {app}
              lesson = {CapacityTalkData.default}
              setup={false}
              fullscreen={true}
              script={GridToolScript.init}
            />
           )}
        </TabContainer>
        <TabContainer dir={theme.direction}>
          {value == 5 && (
            <Arena
              app = {app}
              lesson = {CapacityTalkData.default}
              setup={false}
              fullscreen={true}
              script={OrderingToolScript.init}
            />
           )}
        </TabContainer>
        <TabContainer dir={theme.direction}>
          {value == 6 && (
            <Arena
              app = {app}
              lesson = {CapacityTalkData.default}
              setup={false}
              fullscreen={true}
              script={SharingToolScript.init}
            />
           )}
        </TabContainer>
        <TabContainer dir={theme.direction}>
          {value == 7 && (
            <Arena
              app = {app}
              lesson = {CapacityTalkData.default}
              setup={false}
              fullscreen={true}
              script={CuisenaireToolScript.init}
            />
           )}
        </TabContainer>
        <TabContainer dir={theme.direction}>
          {value == 8 && (
            <FactorBlocks/>
           )}
        </TabContainer>
        <TabContainer dir={theme.direction}>
          {value == 9 && (
            <Arena
              app = {app}
              lesson = {CapacityTalkData.default}
              setup={false}
              fullscreen={true}
              script={FractionStacksScript.init}
            />
           )}
        </TabContainer>
      </SwipeableViews>
    </div>
  );
}
