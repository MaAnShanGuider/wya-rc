/**
 * 日历Item
 */
import React, { Component } from 'react';
import classnames from 'classnames';

class Item extends Component {
	constructor(props) {
		super(props);
	}

	handleClick = () => {

	};

	getCurrentDay = () => {
		let date = new Date();
		let year = date.getFullYear();
		let month = parseInt(date.getMonth() + 1);// 0-11, 0为1月份
		let day = date.getDate();
		return `${year}-${parseInt(month) < 10 ? '0' + month : month}-${parseInt(day) < 10 ? '0' + day : day}`;
	};

	renderItem = () => {
		const { itemData, tipInfo } = this.props;

		const classes = classnames('rc-flex-cc rc-fd-c', {
			'rc-c-dark': itemData.type.selectedDate === 'current',
			'__circle': itemData.dateName === this.getCurrentDay(),
			'rc-pointer': itemData.dateName === this.getCurrentDay(),
		});

		return (
			<div className={classes}>
				<div>{itemData.day}</div>
				{/* <span className="g-dot g-bg-blue" />*/}
			</div>
		);
	};

	render() {

		return (
			<div className="g-col g-tc g-c-gray g-flex-cc _item"
				 onClick={this.handleClick}
			>
				{this.renderItem()}
			</div>
		);
	}
}

export default Item;
