import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Swiper extends Component {
	constructor(props) {
		super(props);
		let { data, currentWidth } = this.props;
		let len = data ? data.length : 1;
		let width = len * 100 + '%';
		let currentIndex = 0;

		currentWidth = currentWidth == parseInt(currentWidth) ? currentWidth : parseInt(currentWidth);

		let slidesLeft = data.map((ele, index) => {
			if (index - currentIndex >= -1) {
				return index * currentWidth;
			} else {
				return (index + len) * currentWidth;
			}
		});
		let currentTransLateX = -1 * currentIndex * currentWidth;
		
		this.state = {
			data: [...data],
			currentWidth,
			slidesLeft,
			// 位移
			currentTransLateX,
			// 当前的正在展示的序列号
			currentIndex,
			// 父容器
			contentStyle: {
				width: width,
				height: '100%',
				transform: `translate3d(${currentTransLateX}px, 0, 0)`,
				position: 'relative',
				top: 0,
				left: 0
			}
		};

		// 
		this.timer = null;
		this.clickSafe = {
			allowClicked: true,
			allowSlided: true
		};
		this.touchObject = {};

	}

	/**
	 * 只有上一次的点击事件执行完，才能点击下一个
	 * 下面生命周期的操作
	 */
	componentDidMount() {
		// 根据this.props.autoPlay 来决定是否自动播放
		let { autoPlay } = this.props;
		!!autoPlay && this.autoPlaySlide();

	}

	/**
	 * 上面是生命周期的操作
	 * 自动播放
	 */
	autoPlaySlide() {
		let { autoPlay } = this.props;
		this.timer = setInterval(() => this.nextSlide(), autoPlay);
	}

	/**
	 * 点击事件
	 * arg 变量就是 当前的currentIndex 减去 下一个的将要被展示的 currentIndex
	 * 这里为什么是1 ， 因为他要向左移动一个单位，当前的currentIndex 
	 * 减去 下一个的将要被展示的 currentIndex 所以是正1
	 */
	preSlide = () => {
		let { currentIndex, data } = this.state;
		let { autoPlay } = this.props;
		let len = data.length;
		let arg = 1;

		// 判断 是否 设置 autoplay
		if (!this.hasInterval()) {
			return;
		}

		currentIndex -= arg;

		// 当第一个的子元素的left为0 并且父容器的translateX ==0 时，
		// 我们
		if (currentIndex === -1) {
			this.getTargetLeft(currentIndex);
		}
		this.setState({
			currentIndex
		}, () => {
			this.animateSlide(arg);
		});
	}
	nextSlide = () => {
		let { currentIndex, data } = this.state;
		let { autoPlay } = this.props;
		let len = data.length;
		let arg = -1;

		if (!this.hasInterval()) {
			return;
		}
		currentIndex -= arg;
		// 这里的currentIndex 就是下一个将要被展示出的slide的序号了，
		// 不过加了 nextIndex ，这个currentIndex 叫做 targerIndex 更合适

		this.setState({
			currentIndex
		}, () => {
			this.animateSlide(arg);
		});
	}
	/**
	 * 父容器滚动
	 * arg 为 1，那么就向左走， 为 -1 就向右走。
	 * nextIndex 是下一个将要被展示的slide
	 * 这个 nextIndex 是个很有意思的东西，
	 * 当 arg = -1 和 arg = 1的的时候，nextIndex 都是等于 targetIndex 的，
	 * 如果 arg 不等于 1 或者 -1， 那么 就是下一个sldie的index了。 
	 */
	animateSlide(arg) {
		let { currentIndex, currentTransLateX, currentWidth, data } = this.state;
		let len = data.length;

		// 这个 nextIndex 是处理 多个单位位移的 精髓所在
		let nextIndex = currentIndex + arg - (arg / Math.abs(arg));

		/**
		 *  因为加入了 移动端 的touch事件， 所以， 这里的 targetTranslateX 要重新写
		 */
		let targetTranslateX =  nextIndex === -1 ? 0 : (-currentIndex * currentWidth);
		const doet = () => {

			const { currentTransLateX, contentStyle, slidesLeft } = this.state;
			let nextTransLateX = 0;
			let step = (targetTranslateX - currentTransLateX) / 8;

			step = arg > 0 ? Math.ceil(step) : Math.floor(step);
			nextTransLateX = currentTransLateX + step;

			// 下面这个if还是要多加个判断，用来处理 decorator 的点击情况。
			if (currentTransLateX > targetTranslateX && arg < 0 || // 点击右边的按钮
				currentTransLateX < targetTranslateX && arg > 0 // 点击左边的按钮
			) {
				/**
				 * Math.abs(arg) > 1 则表示，是 多单位位移
				 * Math.abs(currentTransLateX) < slidesLeft[nextIndex]
				 * && slidesLeft[nextIndex] < Math.abs(nextTransLateX)  表示，向左多个单位的临界 
				 * Math.abs(currentTransLateX) > slidesLeft[nextIndex] 
				 * && slidesLeft[nextIndex] > Math.abs(nextTransLateX)  表示， 向右多个单位的临界
				 */
				if (Math.abs(arg) > 1 &&
					Math.abs(currentTransLateX) < slidesLeft[nextIndex] &&
					slidesLeft[nextIndex] < Math.abs(nextTransLateX) ||
					Math.abs(currentTransLateX) > slidesLeft[nextIndex] &&
					slidesLeft[nextIndex] > Math.abs(nextTransLateX)
				) {
					// 临界进入这里
					this.getTargetLeft(nextIndex);
					nextIndex -= (arg / Math.abs(arg));
				} else {
					// 处理左右点击按钮，只位移一个单位的 情况。
					contentStyle.transform = `translate3d(${nextTransLateX}px, 0, 0)`;
					this.setState({
						currentTransLateX: nextTransLateX,
						contentStyle
					});
				}

				window.requestAnimationFrame(doet);
			} else {
				/**
				 * 这里要对 currentIndex 做判断，当 currentIndex === length  时，
				 * 重新设置 currentIndex , 并且执行 回调里的getTargetLeft()
				 */
				let { currentWidth } = this.state;
				this.clickSafe.allowClicked = true;

				if (currentIndex === len && arg < 0) {
					currentIndex = 0;
					this.criticalityTime(currentIndex, len);
					return;
				} else if (currentIndex === -1 && arg > 0) {
					currentIndex = len - 1;
					this.criticalityTime(currentIndex, len);
					return;
				}

				this.criticalityTime(currentIndex, len);
			}
		};

		window.requestAnimationFrame(doet);
	}
	/**
	 * 返回移动端的 touch事件
	 */
	getTouchedEvent = () => {
		let { mode } = this.props;
		if (mode === 'web') return null;
		return {
			// 触碰开始， 停止 定时器
			onTouchStart: (e) => {
				if (!this.hasInterval()) {
					return;
				}
				// console.log('开始咯');
				this.touchObject = {
					...this.touchObject,
					startX: e.touches[0].pageX,
					startY: e.touches[0].pageY,
				};
			},
			// 触碰移动, 
			onTouchMove: (e) => {
				let {
					currentTransLateX: nextTransLateX,
					contentStyle,
					currentIndex
				} = this.state;
				const preLength = this.touchObject.preLength || 0;
				const direction = this.swipeDirection(
					this.touchObject.startX,
					e.touches[0].pageX,
					this.touchObject.startY,
					e.touches[0].pageY
				);
				if (direction !== 0) {
					// e.preventDefault();
				}
				const length = Math.round(
					Math.sqrt(
						Math.pow(e.touches[0].pageX - this.touchObject.startX, 2)
					)
				);
				this.touchObject = {
					startX: this.touchObject.startX,
					startY: this.touchObject.startY,
					endX: e.touches[0].pageX,
					endY: e.touches[0].pageY,
					length,
					direction,
					preLength: length

				};
				/**
				 * length - preLength 
				 * 就是 这次的 位移 
				 * 而且 有个特殊的情况，就是当 currentIndex === 0,并且我们向左转时，我们要重新设置一下定位。
				 * 
				 */
				if ( currentIndex === 0 && direction === -1 && length - preLength < 20 ) {
					this.setState({
						currentIndex: -1
					}, () => {
						this.getTargetLeft(-1);
					});
				}
				
				nextTransLateX -= direction * (length - preLength);

				contentStyle.transform = `translate3d(${nextTransLateX}px, 0, 0)`;
				this.setState({
					currentTransLateX: nextTransLateX,
					contentStyle: { ...contentStyle }
				});

				// 在这里，对 length进行判断。
			},
			// 触碰结束， 将touchObject初始化为空对象 ，定时器存在的话， 就恢复定时器
			onTouchEnd: (e) => {
				let {
					length,
					direction
				} = this.touchObject;
				let { currentIndex } = this.state;
				let { autoPlay } = this.props;
				let arg = -1 * direction;
				/**
				 * 根据 length 的大小， 来决定 是否运动。或者 复位
				 */
				// console.log('结束了');
				if (length >= 20 ) {
					
					if (currentIndex === -1) {
						this.animateSlide(arg);
					} else {
						currentIndex -= arg;
						this.setState({
							currentIndex
						}, () => {
							this.animateSlide(arg);
						});
					}
				} else {
					/**
					 * length < 20,不进行轮播。图片复位,同时，恢复定时器。
					 */
					this.getTargetLeft();
					this.clickSafe.allowClicked = true;
					!!autoPlay && this.autoPlaySlide();
				}

				this.touchObject = {
					preLength: 0
				};
				
			},
			onTouchCancel: (e) => {}
		};
	}

	/**
	 * 判断 touch 的方向，
	 * 1 : right To left
	 * -1: left To right	
	 * 把这个 作为参数 传到 animateSlide,
	 */
	swipeDirection = (x1, x2, y1, y2) => {
		const xDist = x1 - x2;
		const yDist = y1 - y2;
		const r = Math.atan2(yDist, xDist);
		let swipeAngle = Math.round(r * 180 / Math.PI);

		if (swipeAngle < 0) {
			swipeAngle = 360 - Math.abs(swipeAngle);
		}
		if (swipeAngle <= 45 && swipeAngle >= 0) {
			return 1;
		}
		if (swipeAngle <= 360 && swipeAngle >= 315) {
			return 1;
		}
		if (swipeAngle >= 135 && swipeAngle <= 225) {
			return -1;
		}
		if (this.props.vertical === true) {
			if (swipeAngle >= 35 && swipeAngle <= 135) {
				return 1;
			} else {
				return -1;
			}
		}
		return 0;
	}

	/**
	 * 根据参数，或者当前的 currentIndex 来重新设置
	 */
	getTargetLeft(nextIndex) {

		let {
			currentTransLateX,
			contentStyle,
			currentWidth,
			data,
			currentIndex
		} = this.state;
		let len = data.length;

		currentIndex = typeof nextIndex === 'undefined' ? currentIndex : nextIndex;
		let slidesLeft = data.map((ele, index) => {
			// console.log(index, this.state.width, parseInt(this.state.width), len, currentIndex);
			if (currentIndex !== -1) {
				if (index - currentIndex >= -1) {
					return index * parseInt(currentWidth);
				} else {
					return (index + len) * parseInt(currentWidth);
				}
			} else {
				if (index - currentIndex >= 1 && index - currentIndex < len) {
					return (index - currentIndex) * parseInt(currentWidth);
				} else {
					return 0;
				}
			}

		});

		currentTransLateX = currentIndex !== -1 
			? (-1 * currentIndex * currentWidth) 
			: currentIndex * currentWidth;
		contentStyle.transform = `translate3d(${currentTransLateX}px, 0, 0)`;

		this.setState({
			slidesLeft,
			currentTransLateX,
			contentStyle,
			currentIndex
		});
	}

	/**
	 * 点击不同索引的li，进行相应的位移。
	 */
	handleDecoratorClick = (num) => {
		let { currentIndex } = this.state;
		let { autoPlay } = this.props;
		let arg = currentIndex - num;
		console.log(autoPlay);
		if (!this.hasInterval()) return;

		// 这里的currentIndex 就是下一个将要被展示出的slide的序号了
		currentIndex -= arg;

		this.setState({
			currentIndex: num
		}, () => {
			this.animateSlide(arg);
		});
	}

	/**
	 * 点击按钮时，判断 是否存在定时器，以及 不允许 短时间内 多次点击
	 */
	hasInterval = () => {
		if (!!this.timer) {
			clearInterval(this.timer);
		}
		/**
		 * 主要目的还是 阻止多次点击
		 */

		if (!this.clickSafe.allowClicked) {
			return false;
		} else {
			this.clickSafe.allowClicked = false;
			return true;
		}
	}

	/**
	 * 临界点，执行它, 根据 参数， 进而确认 是否改变
	 * 他就是以前的 回调函数
	 */
	criticalityTime = (currentIndex, len) => {
		const { autoPlay } = this.props;
		if (currentIndex === len) {
			currentIndex = 0;
		} else if (currentIndex === -1) {
			currentIndex = len - 1;
		}
		!!autoPlay && this.autoPlaySlide();
		this.getTargetLeft(currentIndex);

	}
	getDecoratorActiveStyle(i) {
		let { currentIndex } = this.state;

		if (i === currentIndex) {
			return true;
		}
		return false;
	}

	renderDecorator = () => {
		let { decorator } = this.props;
		let { data } = this.state;
		return decorator && (
			<ul className = "__decorator">
				{ 
					data.map((ele, i) => {
						return <li 
							key={ele.src + i} 
							className={  this.getDecoratorActiveStyle(i) ? '__decorator-active' : ''} 
							onClick={() => this.handleDecoratorClick(i)}
						></li>;
					})
				}
			</ul>
		);
	}

	renderImgs() {
		let {
			data,
			slidesLeft,
			currentWidth,
			contentChildImgStyle
		} = this.state;

		return data.map((ele, i) => {
			return (
				<div 
					className="__content-child"  
					style={{ left: slidesLeft[i] + 'px', width: currentWidth + 'px' }} 
					key={ele.src}
				>
					<a href={ele.link || '#'} style={{ ...contentChildImgStyle }}>
						<img src={ele.src || '#'} alt=""/>
					</a>
				</div>
			);
		});
	}

	render() {

		let { currentWidth, contentStyle } = this.state;

		return (
			<div className="rc-swiper" style={{ width: currentWidth + 'px' }}>
				<div 
					className="__content" 
					style={{ ...contentStyle }}
					{...this.getTouchedEvent()} 
				>					
					{ this.renderImgs() }					
				</div>
				{ this.renderDecorator() }
				<span className = "__arrow-left"  onClick={this.preSlide}>左</span>
				<span className = "__arrow-right"  onClick={this.nextSlide}>右</span>
			</div>
		);
	}
}
Swiper.propTypes = {
	/**
	 * mdoe 表明 使用 mobile端模式， 还是 web端模式
	 * 
	 */
	mode: PropTypes.oneOf(['mobile', 'web']),
	/**
	 * data 设置 图片源，以及 点击链接
	 */
	data: PropTypes.arrayOf(PropTypes.shape({
		src: PropTypes.string,
		link: PropTypes.string
	})).isRequired,
	/**
	 * 轮播容器 的宽度
	 */
	currentWidth: PropTypes.oneOfType([
		PropTypes.number,
		PropTypes.string
	]),

	/**
	 * 是否自动播放
	 */
	autoPlay: PropTypes.oneOfType([
		PropTypes.number,
		PropTypes.bool
	]),
	/**
	 * 是否显示小点点
	 */
	decorator: PropTypes.bool
};
Swiper.defaultProps = {
	mode: 'web',
	currentWidth: document.documentElement.clientWidth || document.body.clientWidth
};
export default Swiper;