import React, {useEffect} from 'react';
import logo from './logo.svg';
import './App.css';
import Arena from "./components/Arena"
import Panels from "./components/Panels"
import * as Pixi from "pixi.js";
import { BrowserRouter, Switch, Route, Link } from "react-router-dom";
import * as HundredsArrayScript from "./js/hundredsarray.js"
import * as NumberLineStripsScript from "./js/numberlinestrips.js"
import * as FractionWallScript from "./js/fractionwall.js";
import * as FractionLineScript from "./js/numberlinetool.js";
import * as GridToolScript from "./js/gridtool.js";
import * as OrderingToolScript from "./js/orderingtool.js";
import * as SharingToolScript from "./js/sharingtool.js";
import * as NumberStripsScript from "./js/numberlinestrips.js";
import * as CuisenaireToolScript from "./js/cuisenairetool.js";
import * as FractionStacksScript from "./js/fractionstacks.js";
import * as CalculatorScript from "./js/calculator.js";
import * as OldFractionWallScript from "./js/oldfractionwall.js";
import * as GridNodeScript from "./js/gridnodes.js";
import * as ApiTestScript from "./js/apitest.js";
import * as NewFractionStacksScript from "./js/newfractionwall.js";
import * as CapacityTalkData from "./activitydata/CapacityTalk.json";
import ActivityList from './components/ActivityList'
import ManipulativeCarousel from "./components/ManipulativeCarousel"
import SignIn from "./components/SignIn"


Pixi.settings.RESOLUTION = 3
let app = new Pixi.Application(0,0,{backgroundColor: 0xffffff,antialias: true});

const Main = () => (
  <div>
    <Route exact path="/calculator" component={() => <Arena app = {app} features = {{'lock': false}} fullscreen = {true} lesson = {CapacityTalkData.default} script = {CalculatorScript.init}/>} />
    <Route exact path="/hundreds" component={() => <Arena app = {app} features = {{'lock': false}} fullscreen = {true} lesson = {CapacityTalkData.default} script = {HundredsArrayScript.init}/>} />
    <Route exact path="/hundredslock" component={() => <Arena app = {app} features = {{'lock': true}} fullscreen = {true} lesson = {CapacityTalkData.default} script = {HundredsArrayScript.init}/>} />
    <Route exact path="/hundredsregroup" component={() => <Arena app = {app} features = {{'lock': true,'regroup': true}} fullscreen = {true} lesson = {CapacityTalkData.default} script = {HundredsArrayScript.init}/>} />
    <Route exact path="/fractionwall" component={() => <Arena app = {app} fullscreen = {true} lesson = {CapacityTalkData.default} script = {NewFractionStacksScript.init}/>} />
    <Route exact path="/fractionwallodd" component={() => <Arena app = {app} features = {{'values': [1,3,5,7,9,11]}} fullscreen = {true} lesson = {CapacityTalkData.default} script = {NewFractionStacksScript.init}/>} />
    <Route exact path="/fractionwalladjustable" component={() => <Arena app = {app} features = {{'values': [1,2,3,4,5,6,7,8,9,10,11,12],'adjustable': true}} fullscreen = {true} lesson = {CapacityTalkData.default} script = {NewFractionStacksScript.init}/>} />
    <Route exact path="/fractionwalleven" component={() => <Arena app = {app} features = {{'values': [2,4,6,8,10,12]}} fullscreen = {true} lesson = {CapacityTalkData.default} script = {NewFractionStacksScript.init}/>} />
    <Route exact path="/oldfractionwall" component={() => <Arena app = {app} features = {{'lock': true,'regroup': true}} fullscreen = {true} lesson = {CapacityTalkData.default} script = {OldFractionWallScript.init}/>} />
    <Route exact path="/activities/:activity" component={Panels}/>
    <Route exact path="/fractionline" component={() => <Arena app = {app} fullscreen = {true} lesson = {CapacityTalkData.default} script = {FractionLineScript.init}/>} />
    <Route exact path="/apitest" component={() => <Arena app = {app} fullscreen = {true} lesson = {CapacityTalkData.default} script = {ApiTestScript.init}/>} />
    <Route exact path="/fractionstacks" component={() => <Arena app = {app} fullscreen = {true} lesson = {CapacityTalkData.default} script = {FractionStacksScript.init}/>} />
    <Route exact path="/orderingblocks" component={() => <Arena app = {app} fullscreen = {true} lesson = {CapacityTalkData.default} script = {OrderingToolScript.init}/>} />
    <Route exact path="/strips" component={() => <Arena app = {app} fullscreen = {true} lesson = {CapacityTalkData.default} script = {NumberLineStripsScript.init}/>} />
    <Route exact path="/gridnodes" component={() => <Arena app = {app} fullscreen = {true} lesson = {CapacityTalkData.default} script = {GridNodeScript.init}/>} />
    <Route exact path="/stripsopen" component={() => <Arena app = {app} fullscreen = {true} features  = {{'open': true}} lesson = {CapacityTalkData.default} script = {NumberLineStripsScript.init}/>} />
    <Route exact path="/" component={() => <ActivityList/>} />
    <Route exact path="/login" component={SignIn} />
    <Route exact path="/panels" component={Panels} />
    <Route exact path="/manipulatives" component={ManipulativeCarousel} />
  </div>
);

function App() {
  return (
       <BrowserRouter className = "container">
          <Main />
        </BrowserRouter>
  );
}

export default App;
