import React , {Component, Text,useEffect} from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Arena from "./Arena";
import { BrowserRouter, Switch, Route, Link } from "react-router-dom";
import * as FractionWallScript from "../js/fractionwall.js";
import * as NumberLineToolScript from "../js/numberlinetool.js";
import * as GridToolScript from "../js/gridtool.js";
import * as OrderingToolScript from "../js/orderingtool.js";
import * as SharingToolScript from "../js/sharingtool.js";
import * as CuisenaireToolScript from "../js/cuisenairetool.js";
import * as CapacityTalkData from "../activitydata/CapacityTalk.json";
import { Grid , TextField} from "@material-ui/core";
import * as Pixi from "pixi.js";
import Drawer from "@material-ui/core/Drawer";
import { TweenMax, TimelineLite, Power2, Elastic, CSSPlugin, TweenLite, TimelineMax } from "gsap/TweenMax";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import { ACTIVITIES } from "../activitydata/activities.js"
//import { Document } from '@react-pdf/renderer'
//pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

/* <Document
file="pdf/NumberLineLesson.pdf"
>
  <Page pageNumber={1} />
</Document>

*/

const useStyles = makeStyles(theme => ({
  container: {
    justifyContent: 'center',
    flexDirection: 'row'
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  dense: {
    marginTop: theme.spacing(2),
  },
  menu: {
    width: 200,
  },
}));

export default function LessonPanel(props) {


  const classes = useStyles();
  const { activity } = props.match.params
  const data = ACTIVITIES[activity]
  console.log("activity",activity)
  console.log("data",data)
  const [panelNumber,setPanel] = React.useState(0)
  const [label,setLabel] = React.useState("Problem 1")
  const keys = [0,1,2]
  let numberOfPanels = 1
  let panel;
  let page1;
  const [tipsOpen,setTipsOpen] = React.useState(false)
  const [menuOpen,setMenuOpen] = React.useState(false)



  function printList(items){
    console.log("items",items)
    if (items){return items.map(q=>{return <p>{q}<br/><br/></p>})}
 
  }

// So that the correct panel is highlighted on startup
useEffect(()=> {
  numberOfPanels = data.SEQUENCE.length
})
  function animate(k){
    console.log("numberOfPanels",panelNumber,numberOfPanels,panelNumber%numberOfPanels)
    var tl = new TimelineMax()
    if (k == -1) {
      tl.to(panel, 0.5, {x: panel.clientWidth,alpha: 0})
        .to(panel,0, {x: -panel.clientWidth,alpha: 1})
        .to(panel,1,{x: 0})
        setTimeout(()=>setPanel((panelNumber > 0 ? panelNumber -1 : 0)),500)
    } else if (k == 1) {
      tl.to(panel, 0.5, {x: -panel.clientWidth,alpha: 0})
        .to(panel,0, {x: panel.clientWidth,alpha: 1})
        .to(panel,1,{x: 0})
        setTimeout(()=>setPanel((panelNumber+1)%numberOfPanels),500)
    }
  }

  function initButtons(){
    let buttons = [ <a className ="waves-effect grey waves-light btn"  style = {{margin: 2}} onClick = {()=>animate(-1)}><i className="material-icons">chevron_left</i></a>,<a className ="waves-effect grey waves-light btn"  style = {{margin: 2}}  onClick = {()=>animate(1)}><i className="material-icons">chevron_right</i></a>]
    return buttons;
  }


    return (
      <div>
      <Drawer anchor="left"  open={menuOpen} onClose={()=>setMenuOpen(false)}>
            <div className = "flow-text" style = {{margin: 10,width: window.innerWidth/3}}> 
            <Link target = "_blank" to = {data.TOOL}>Tool </Link>
            </div>
        </Drawer>
        <Drawer anchor="right"  open={tipsOpen} onClose={()=> setTipsOpen(false)}>
            <div className = "flow-text" style = {{margin: 10,width: window.innerWidth/3}}> 
            {printList(data.SEQUENCE[panelNumber].tips)} 
            </div>
        </Drawer>
      <div style = {{display: 'flex',width: '100%'}} >
      <div style = {{flex: 1,margin: 3}}>
        <a onClick = {()=> setMenuOpen(true)}className ="btn orange"><i className="material-icons">menu</i></a>
      </div>
      <div  className = "center" style = {{flex: 1}}>
        {initButtons()}
        </div>
        <div style = {{flex: 1,float: 'right'}}>
        <a onClick = {()=> setTipsOpen(true)}className ="btn orange right"><i className="material-icons">forum</i></a>
      </div>
      </div>
        <div className = 'center' ref = {me => panel = me } > 
          <img style = {{width: '95%'}} src = {data.SEQUENCE[panelNumber].img}/>
        </div>
      </div>
    );
}
