// 独立的Vuex插件项目，这里不要把 Vue import 进来，以减少插件大小
// 定义 Vue 的变量
let Vue;
// Store 用于管理 state mutations actions getters
class Store {
    constructor(options) {
        // 依赖于 Vue 的数据响应式
        this.state = new Vue({
            data: options.state
        })
        this.mutations = options.mutations
        this.actions = options.actions
        options.getters && this.handleGetters(options.getters)
    }
    // commit 声明为箭头函数
    // commit 在异步函数中执行，保持 this 指向当前 Store 组件实例
    commit = (type, arg) => {
        this.mutations[type](this.state, arg)
    }
    // 不需要箭头函数
    // dispatch 不会被其他的方法调用，this 始终指向当前 Store 组件实例
    // {
    //     commit: this.commit,
    //     state: this.state
    // }
    // 这里上下文的值 this.commit 可能会导致 this 指向混乱
    // this.store.dispatch({ commit, state })
    dispatch(type, arg) {
        this.actions[type]({
            commit: this.commit,
            state: this.state
        }, arg)
    }
    // getters: 形参
    // this.getters: 当前实例的变量
    handleGetters(getters) {
        this.getters = {}
        //遍历 getters 的所有 key
        Object.keys(getters).forEach(key => {
            // 为 this.getters 定义若干属性，这些属性是只读的
            // this.$store.getters.score
            Object.defineProperty(this.getters, key, {
                get: () => {
                    return getters[key](this.state)
                }
            })
        })
    }
}
// Vue.use(Vuex)
// install 方法 用于引用 Vuex 插件
// 通过参数 _Vue 传进来
function install(_Vue) {
    // 保存 Vue 的实例
    Vue = _Vue
    // minxin 只有在需要当前组件的实例的时候才需要进行混入
    // 这里可以直接 Vue.prototype.$store = this.$options.store
    Vue.mixin({
        beforeCreate() {
            if (this.$options.store) {
                Vue.prototype.$store = this.$options.store
            }
        }
    })
}
// Vuex: { Store, install }
export default { Store, install }