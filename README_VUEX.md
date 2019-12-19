# min-Vuex 插件
#### vuex : `export default { Store, install }`
#### 插件 : install 方法 -> Vue.use() 引入
#### 混入 : install 方法内通过 Vue.mixin(beforeCreate(){}) 扩展组件  与 vue 生命周期中的 beforeCreate() 钩子混到一起执行
独立的Vuex插件项目，这里不要把 Vue import 进来，以减少插件大小

在 rxvuex 内定义 Vue 的变量

通过参数 _Vue 传入 保存 Vue 的实例

minxin 只有在需要当前组件的实例的时候才需要进行混入

这里可以直接 Vue.prototype.$store = this.$options.store
```js
// VueRouter.install
let Vue
function install(_Vue) {
    Vue = _Vue // 
    Vue.mixin({
        beforeCreate() {
            if (this.$options.store) {
                Vue.prototype.$store = this.$options.store
            }
        }
    })
}
```
#### 实现 store state mutations actions getters
state 依赖于 Vue 的数据响应式
commit 声明为箭头函数 commit 在异步函数中执行，保持 this 指向当前 Store 组件实例
不需要箭头函数
- { commit: this.commit, state: this.state }
- this.store.dispatch({ commit, state }) 这里上下文的值 this.commit 可能会导致 this 指向混乱
dispatch 不会被其他的方法调用，this 始终指向当前 Store 组件实例
```js
class Store {
    constructor(options) {
        this.state = new Vue({
            data: options.state
        })
        this.mutations = options.mutations
        this.actions = options.actions
        options.getters && this.handleGetters(options.getters)
    }
    commit = (type, arg) => {
        this.mutations[type](this.state, arg)
    }
    dispatch(type, arg) {
        this.actions[type]({
            commit: this.commit,
            state: this.state
        }, arg)
    }
    handleGetters(getters) {
        this.getters = {}
        Object.keys(getters).forEach(key => {
            Object.defineProperty(this.getters, key, {
                get: () => {
                    return getters[key](this.state)
                }
            })
        })
    }
}
```
### **Object.defineProperty(obj, prop, descriptor)**
Object.defineProperty()方法会直接在一个对象上定义一个新属性，或者修改一个已经存在的属性， 并返回这个对象
#### obj
需要定义属性的对象
#### prop
需要定义或修改的属性
#### descriptor
将被定义或修改属性的描述符
#### get
给属性提供getter的方法，如果没有 getter
则为undefined。

当我们读取某个属性的时候，其实是在对象内部调用了该 方法，此方法必须要有return语句。

该方法返回值被用作属性值。默认为 undefined 

#### set
设置属性值的方法， 如果没有 setter 则为 undefined。

该方法将接受唯一参数，并将该参数的新值分配给该属性。默认为 undefined。

也就是说，当我们设置某个属性的时候，实际上是在对象的内部调用了该方法

### **modules 属性未实现**