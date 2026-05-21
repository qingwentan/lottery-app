export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '抽奖',
    })
  : {
      navigationBarTitleText: '抽奖',
    };
