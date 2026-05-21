export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '奖项管理',
    })
  : {
      navigationBarTitleText: '奖项管理',
    };
