
import React, { Component }  from 'react';
import PropTypes from 'prop-types';
/*
	.rc-swiper-content-child的样式
 */
const childStyle = {
	height: '100%',
	width: '100%',

};
class Swiper extends Component {
	// 多考虑考虑极限 
	constructor(props) {
		super(props);
		let len = this.props.data ? this.props.data.length : 1;
		let width = len * 100 + '%';
		let currentIndex = 0;
		let currentWidth =  
			this.props.styles.width == parseInt(this.props.styles.width)
				? this.props.styles.width
				: parseInt(this.props.styles.width);
		let slidesLeft = this.props.data.map((ele, index) => {
			// return  (index - currentIndex + 1)  * parseInt(this.props.styles.width);
			// 哈哈哈哈，逻辑 就是下面这些
			if (index - currentIndex >= -1) {
				return index * currentWidth;
			} else {
				return (index + len) * currentWidth;
			}
		});
		let currentTransLateX = -1 * currentIndex * currentWidth;
		this.state = {
			data: [...this.props.data],
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

			},
			// img标签的样式
			contentChildImgStyle: {
				width: '100%',
				display: 'block'
			}
		};
	} 
	// 只有上一次的点击事件执行完，才能点击下一个
	clickSafe = { allowClicked: true };
	// -----下面生命周期的操作
	componentDidMount() {
		console.log(this.clickSafe);
	}
	// -----上面是生命周期的操作
	// 点击事件
	// arg 变量就是 当前的currentIndex 减去 下一个的将要被展示的 currentIndex
	// 这里为什么是1 ， 因为他要向左移动一个单位，当前的currentIndex 
	// 减去 下一个的将要被展示的 currentIndex 所以是正1
	preSlide = () => {
		let currentIndex = this.state.currentIndex;
		let len = this.state.data.length;
		let arg =  1; 

		if (!this.clickSafe.allowClicked) {
			return;
		} else {
			this.clickSafe.allowClicked = false;
		}
		currentIndex -= arg;		
		const callback = (currentIndex, len) => {		
			if (currentIndex === -1) {	
				currentIndex = len - 1;						
			}
			this.getTargetLeft(currentIndex);
		};
		if (currentIndex === -1) {	
			this.getTargetLeft(currentIndex);				
		}
		this.setState({ currentIndex }, () => {
			this.animateSlide(arg, callback);
		});
	}
	nextSlide = () => {
		let currentIndex = this.state.currentIndex;
		let len = this.state.data.length;
		let arg =  -1; 
		if (!this.clickSafe.allowClicked) {
			return;
		} else {
			this.clickSafe.allowClicked = false;
		}
		currentIndex -= arg;
		// 这里的currentIndex 就是下一个将要被展示出的slide的序号了，
		// 不过加了 nextIdnex ，这个currentIndex 叫做 targerIndex 更合适
		const callback = (currentIndex, len) => {	
			if (currentIndex === len) {	
				currentIndex = 0;							
			}
			this.getTargetLeft(currentIndex);
		};
		this.setState({ currentIndex }, () => {
			this.animateSlide(arg, callback);
		});
	}
	// 父容器滚动
	// 因为父容器的translateX都是小于等于0的，
	// arg 为 1，那么就向左走， 为 -1 就向右走。
	// nextIndex 是下一个将要被展示的slide
	// 
	// 这个 nextIndex 是个很有意思的东西， 
	// 	当 arg = -1 和 arg = 1的的时候，nextIndex 都是等于 currentIndex 的，
	// 	如果 arg 不等于 1 或者 -1， 那么 就是下一个sldie的index了。 
	animateSlide(arg, callback){
		let len = this.state.data.length;
		let currentIndex = this.state.currentIndex;

		// 这个 nextIndex 是处理 多个单位位移的 精髓所在
		let nextIndex = currentIndex + arg - (arg / Math.abs(arg));

		let targetTranslateX = 
				this.state.currentTransLateX + arg * this.state.currentWidth;
		const  doet = () => {
			let currentTransLateX = this.state.currentTransLateX;
			let contentStyle = { ...this.state.contentStyle };
			let nextTransLateX = 0;
			let step = (targetTranslateX - currentTransLateX) / 8;
			step = arg > 0 ? Math.ceil(step) : Math.floor(step);
			nextTransLateX = currentTransLateX + step;
			// 下面这个if还是要多加个判断，用来处理 decorator 的点击情况。
			if (
				// 点击右边的按钮
				currentTransLateX > targetTranslateX && arg < 0
				// 点击左边的按钮
				|| currentTransLateX < targetTranslateX && arg > 0
			) {			
				// console.log(arg);
				if (Math.abs(arg) > 1) {
					// 就是在这里了。处理位移多个单位的情况。这里是最坑的情况了，很绕
					// 在多个单位位移中， currentIndex 叫做 targetIndex 更为合适。
					// 所以我们要引入，nextIndex, 用来处理临界情况
					//  currentTransLateX < nextIndex.left < nextTransLateX ,这就是临界
					console.log(Math.abs(currentTransLateX) > this.state.slidesLeft[nextIndex], this.state.slidesLeft[nextIndex] > Math.abs(nextTransLateX));
					console.log(nextIndex);
					if ( Math.abs(currentTransLateX) < this.state.slidesLeft[nextIndex] 
						&& this.state.slidesLeft[nextIndex] < Math.abs(nextTransLateX) 
						||  Math.abs(currentTransLateX) > this.state.slidesLeft[nextIndex] 
						&& this.state.slidesLeft[nextIndex] > Math.abs(nextTransLateX) 
					) {
						// 临界进入这里
						this.getTargetLeft(nextIndex);
						nextIndex -= (arg / Math.abs(arg));

					} else {
						contentStyle.transform =  `translate3d(${nextTransLateX}px, 0, 0)`;
						this.setState({
							currentTransLateX: nextTransLateX,
							contentStyle
						});
					}
					
				} else {
					// 处理左右点击按钮，只位移一个单位的 情况。
					contentStyle.transform =  `translate3d(${nextTransLateX}px, 0, 0)`;
					this.setState({
						currentTransLateX: nextTransLateX,
						contentStyle
					});
				}
				window.requestAnimationFrame(doet);
			} else {
				// 这里要对 currentIndex 做判断，当 currentIndex === length  时，
				// 重新设置 currentIndex , 并且执行 getTargetLeft()
			
				this.clickSafe.allowClicked = true;
				if ( currentIndex === len && arg < 0 ) {
					currentIndex = 0;
					if (callback) callback(currentIndex, len);
					return;
				} else if (currentIndex === -1 && arg > 0) {
					currentIndex = len - 1;
					targetTranslateX = -1 * currentIndex * this.state.currentWidth;
					if (callback)  callback(currentIndex, len);
					return;
				}
				if (callback)  callback(currentIndex, len);
			}
		};

		window.requestAnimationFrame(doet);
	}
	//
	getTargetLeft(nextIndex) {
		let currentTransLateX = this.state.currentTransLateX;
		let contentStyle = { ...this.state.contentStyle };
		let currentWidth = this.state.currentWidth;
		let len = this.state.data.length;
		let currentIndex =  typeof nextIndex === 'undefined' ? this.state.currentIndex : nextIndex;
		let slidesLeft = this.state.data.map((ele, index) => {
			if (currentIndex !== -1) {
				if (index - currentIndex >= -1) {
					return index * parseInt(this.props.styles.width);
				} else {
					return (index + len) * parseInt(this.props.styles.width);
				}
			} else {
				if (index - currentIndex >= 1 && index - currentIndex < len ) {
					return (index - currentIndex) * parseInt(this.props.styles.width);
				} else {
					return 0;
				}
			}

		});
		currentTransLateX = currentIndex !== -1 
			? (-1 * currentIndex * currentWidth) 
			: currentIndex * currentWidth;
		contentStyle.transform =  `translate3d(${currentTransLateX}px, 0, 0)`,
		this.setState({ slidesLeft, currentTransLateX, contentStyle, currentIndex });
	}
	// 点击不同索引的li，进行相应的位移。
	handleDecoratorClick = (num) => {
		// 不应该这里setState({currentIndex: num});
		let currentIndex = this.state.currentIndex;
		let arg = currentIndex - num;
		if (!this.clickSafe.allowClicked) {
			return;
		} else {
			this.clickSafe.allowClicked = false;
		}
		currentIndex -= arg;
		// 这里的currentIndex 就是下一个将要被展示出的slide的序号了
		const callback = (currentIndex, len) => {	
			if (currentIndex === len) {	
				currentIndex = 0;							
			}
			this.getTargetLeft(currentIndex);
		};
		this.setState({ currentIndex: num }, () => {
			this.animateSlide(arg, callback);
		});
	}
	getChildStyles(index) {
		let width =  this.state.currentWidth + 'px';
		return {
			position: 'absolute',
			top: 0,
			height: '100%',
			width
		};
	}
	getDecoratorStyle() {
		return {
			position: 'absolute',
			height: '26px',
			width: '100%',
			display: 'flex',
			justifyContent: 'center',
			bottom: '10px',
			left: 0,
			listStyle: 'none'

		};
	}
	getStyleTagStyles() {
		return `.rc-swiper-decorator > li {
							width: 24px; 
							height: 24px;
							border: 1px solid rgba(255, 255, 255, .5);
							display: block;
							margin: 0 10px;
							background: rgba(255, 255, 255, .5)
						}
				.rc-swiper-decorator li.rc-swiper-decorator-active {
					background: rgba(22, 244, 67, .8);
				}
						`;
	}
	getArrowStryle(arg) {
		if (arg) {
			return {
				position: 'absolute',
				left: '10px',
				top: 0,
				bottom: 0,
				width: '24px',
				height: '24px ',
				margin: 'auto',
				font: '16px/24px ""',
				background: '#ff0034'

			};
		} else {
			return {
				position: 'absolute',
				right: '10px',
				top: 0,
				bottom: 0,
				width: '24px',
				height: '24px ',
				margin: 'auto',
				font: '16px/24px ""',
				background: '#ff0034'

			};
		}
		
	}
	getDecoratorActiveStyle(i) {
		let currentIndex = this.state.currentIndex;
		if (i === currentIndex) {
			return true;
		} else return false;
	}
	render() {
		let imgs = this.state.data.map((ele, i) => {
			return (
				<div 
					className="rc-swiper-content-child"  
					style={{ ...this.getChildStyles(i), left: this.state.slidesLeft[i] + 'px' }} 
					key={ele.src}
				>
					<a href={ele.link} style={this.state.contentChildImgStyle}>
						<img src={ele.src} alt="" style={this.state.contentChildImgStyle}/>
					</a>
				</div>
			);
		});
		let decorator = this.props.decorator 
			? ( <ul 
				className = "rc-swiper-decorator"
				style={{ ...this.getDecoratorStyle() }}>
				{this.state.data.map((ele, i) => {
					return <li 
						key={ele.src + i} 
						className={  this.getDecoratorActiveStyle(i) ? 'rc-swiper-decorator-active' : ''} 
						onClick={() => this.handleDecoratorClick(i)}
					></li>;
				})
				}
				<style
				  type="text/css"
				  dangerouslySetInnerHTML={{ __html: this.getStyleTagStyles() }}
				/>
			</ul>) 
			: null;
		return (
			<div className="rc rc-swiper-container" style={this.props.styles}>
				<div className="rc-swiper-content" style={{ ...this.state.contentStyle }}>					
					{ imgs }					
				</div>
				{ decorator }
				<span style={{ ...this.getArrowStryle(true) }} onClick={this.preSlide}>左</span>
				<span style={{ ...this.getArrowStryle(false) }} onClick={this.nextSlide}>右</span>
			</div>
		);
	}
}
Swiper.propTypes = {
	data: PropTypes.arrayOf(PropTypes.shape({
							    src: PropTypes.string,
							    link: PropTypes.string
							  })).isRequired,
	styles: PropTypes.shape({
		width: PropTypes.string,
		height: PropTypes.string
	}),
	autoPlay: PropTypes.number,
	decorator: PropTypes.bool
};
Swiper.defaultProps = {
	data: [
		{ src: 'http://img.hb.aicdn.com/31eb4c33546699283593648768652858960013bc1b95e-yLHmw4_fw658', link: '#' },
		{ src: 'http://img.hb.aicdn.com/95112d6d25c26213edae99974585aeea4f5873041c4a7-pi5rg5_fw658', link: '#' },
		{ src: 'http://img.hb.aicdn.com/2120fcacbb8bfffc8539600e27ad2427cde7f0eb16909-HT1bKp_fw658', link: '#' },
		{ src: 'http://img.hb.aicdn.com/b547ba09bc7c6b37a035ab80d5cc84bc2946a48216f6c-Si5lfZ_fw658', link: '#' },
		{ src: 'http://img.hb.aicdn.com/a230a189644aab69b3ed7c4764c9c121df4dcce02551d-dg5zdv_fw658', link: '#' },
	],
	styles: {
		height: '200px',
		width: '400px',
		margin: 'auto',		
		overflow: 'hidden',
		border: '1px solid black',
		position: 'relative',
		top: 0,
		left: 0
	},
	decorator: true,

	autoPlay: 3000
};
export default Swiper;



