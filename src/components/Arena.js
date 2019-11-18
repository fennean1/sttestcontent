import React, { Component } from "react";
import Paper from '@material-ui/core/Paper';
import Drawer from '@material-ui/core/Drawer';
import { TweenMax, TimelineLite, Power2, Elastic, CSSPlugin, TweenLite, TimelineMax } from "gsap/TweenMax";

import * as Pixi from "pixi.js";

class Arena extends Component {
  constructor() {
    super();
    this.app = {};
    this.state = {
      open: false,
      loaded: false,
    }
  }

 handleClose() {
  this.setState({open: false})
  };

  componentWillUnmount(){
    this.props.app.resizable = false
    this.props.app.active = false
    let children = this.props.app.stage.children
    for (var i = children.length - 1; i >= 0; i--) {	this.props.app.stage.removeChild(children[i]);};
    for (var i = children.length - 1; i >= 0; i--) {	children[i].destroy(true);};
  }

  componentWillMount() {
    // Setting up app.
    //this.props.app = new Pixi.Application(0,0,{backgroundColor: 0xffffff,antialias: true});
    console.log("calling component will mount")
    window.onresize = () => this.resize()
    this.props.app.renderer.backgroundColor = 0xffffff;
    this.props.app.renderer.resolution = 3
    this.props.app.renderer.autoDensity = true
    this.props.app.stage.y = 0
  }

  loadInstructions(){
    this.setState({open: true})
  }

  resize(){
    console.log("this.props.app.resizable",this.props.app.resizable)
    console.log("this.props.app.active",this.props.app.active)
    if (this.props.app.active){
      if (this.props.app.resizable){
        this.props.app.resize({width: this.gameCanvas.clientWidth,height: this.gameCanvas.clientHeight})
      } else {
        console.log("redrawing")
        this.redraw()
      }
   }
}

  redraw(){
    let children = this.props.app.stage.children
    this.props.app.stage.y = 0
    for (var i = children.length - 1; i >= 0; i--) {	this.props.app.stage.removeChild(children[i]);};
    for (var i = children.length - 1; i >= 0; i--) {	children[i].destroy(true);};

    const setup = {
      height: this.gameCanvas.clientHeight,
      width: this.props.width != null ? this.props.width : this.gameCanvas.clientWidth,
      props: this.props
    };

    this.props.app.renderer.resize(this.gameCanvas.clientWidth,this.gameCanvas.clientHeight)
    this.props.script(this.props.app, setup);
  }

  componentDidMount() {
    this.setState({loaded: true})
    this.setState({panelNumber: this.props.panelNumber})
    // Attached app view to gameCanvas
    this.gameCanvas.appendChild(this.props.app.view);
    this.props.app.active = true
    this.props.app.resizable = false
    const setup = {
      height: this.gameCanvas.clientHeight,
      width: this.props.width != null ? this.props.width : this.gameCanvas.clientWidth,
      props: this.props
    };

    this.props.app.help = () => this.loadInstructions()
    this.props.app.renderer.resize(this.gameCanvas.clientWidth,this.gameCanvas.clientHeight)
    this.props.script(this.props.app, setup);
    console.log("game canvas",this.gameCanvas)

  }

  printList(items){
    console.log('items',items)
    if (items){return items.map(q=>{return <p>{"\u2022 \u0085"+q}<br/><br/></p>})}
 
  }

  animate(){
    var tl = new TimelineMax()
    tl.to(this.gameCanvas, 0.5, {x: this.gameCanvas.clientWidth,alpha: 0})
      .to(this.gameCanvas,0, {x: -this.gameCanvas.clientWidth,alpha: 1})
      .to(this.gameCanvas,1,{x: 0})
  }

  render() { 
    let styleType = this.props.fullscreen ? { height: "100vh",marginTop: 0 } : null;

    if (this.state.loaded && this.props.panelNumber != this.state.panelNumber) {
      setTimeout(()=>this.redraw(),500) 
      this.setState({panelNumber: this.props.panelNumber})
    }

    return (
        <div>
        <Drawer anchor="left"  open={this.state.open} onClose={this.handleClose.bind(this)}>
          <Paper className = "padded margins ">
            <span >Questions</span>
              <p>{this.printList(this.props.lesson.questions)}</p>
          </Paper>
        </Drawer>
        <div style = {styleType}
          ref={me => {
            this.gameCanvas = me;
          }}
        />
      </div>
    );
  }
}

export default Arena;
