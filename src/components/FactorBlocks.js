import React, { Component } from "react";

const CORAL = "#FF4848";
const BLUE = "#51D0FF";
const GREEN = "#7ADA64";
const PURPLE = "#B478FF";
const YELLOW = "#FFFD82";
const ORANGE = "#ffb84d";
const PINK = "#ff66ff";
const RED = "#ff3333";
const BROWN = "#bf8040";
const SEXY_GREEN = "#669999";
const STRONG_GREEN = "#00b359";
const STRONG_YELLOW = "#ffff00";
const BLUE_GREY = "#8585ad";

class FractionList extends Component {
  constructor(props) {
    super(props);

    this.colors = [
      BLUE,
      GREEN,
      PURPLE,
      YELLOW,
      ORANGE,
      PINK,
      RED,
      BLUE_GREY,
      SEXY_GREEN,
      STRONG_GREEN,
      STRONG_YELLOW,
      BROWN
    ];
    this.colorIndex = 0;

    this.state = {
      whole: 24
    };
  }

  returnNBlocks(n) {
    let arr = [];
    for (let i = 0; i < n; i++) {
      arr.push(i);
    }

    let color = n > this.colors.length ? BLUE_GREY : this.colors[n - 1];

    const liStyle = {
      background: ORANGE,
      margin: 2,
      flexGrow: 1,
      textAlign: "center",
      verticalAlign: "center"
    };

    return arr.map(e => (
      <div className="grow" style={liStyle}>
        {this.state.whole / n}
      </div>
    ));
  }

  handleChange(event) {
    this.setState({ whole: event.target.value });
  }

  renderRows(n) {
    if (isNaN(n)) {
      return null;
    } else {
      let arr = [];
      let testArr = [1, 2, 3];
      for (let i = 0; i <= n; i++) {
        arr.push(i);
      }
      return arr.map(e => (
        <div style={{ display: "flex" }}>
          {(this.state.whole / e) % 1 == 0 && this.returnNBlocks(e)}
        </div>
      ));
    }
  }
  render() {
    return (
      <div>
        <input
          className="center"
          //type="text"
          value={this.state.whole}
          onChange={this.handleChange.bind(this)}
        />
        <div className="scroller">{this.renderRows(this.state.whole)}</div>
      </div>
    );
  }
}

export default FractionList;
