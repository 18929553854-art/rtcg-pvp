const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
module.exports=function createEngine(hooks){
 const nodes=new Map();class Element{constructor(tag){this.tagName=tag;this.children=[];this.value='';this.dataset={};this.hidden=false;this.open=false;this.disabled=false;this.classList={toggle(){},add(){},remove(){}};this.style={setProperty(){}};}set id(v){this._id=v;nodes.set(v,this)}get id(){return this._id}set innerHTML(v){for(const m of v.matchAll(/id="([^"]+)"/g)){const n=new Element('div');n.id=m[1];this.children.push(n)}}append(...xs){this.children.push(...xs)}prepend(...xs){this.children.unshift(...xs)}replaceChildren(...xs){this.children=xs}addEventListener(){}setAttribute(){}querySelectorAll(){return []}querySelector(){return null}showModal(){this.open=true}close(){this.open=false}}
 const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'original.html'),'utf8');for(const m of html.matchAll(/id="([^"]+)"/g)){const n=new Element('div');n.id=m[1]}
 const menu=new Element('div'),main=new Element('main'),document={createElement:t=>new Element(t),getElementById:id=>nodes.get(id),querySelector:s=>s==='.menu-options'?menu:main,head:new Element('head'),body:new Element('body'),addEventListener(){}};
 const randomMath=Object.create(Math);randomMath.random=()=>crypto.randomInt(0,2**48-1)/(2**48-1);
 const context={Math:randomMath,console,document,Image:class extends Element{constructor(){super('img')}},localStorage:{getItem(){return null},setItem(){}},alert(){},confirm(){return true},setTimeout(){return 1},clearTimeout(){},crypto:crypto.webcrypto};context.window={scrollTo(){},addEventListener(){}};vm.createContext(context);
 vm.runInContext(html.match(/<script>([\s\S]*)<\/script>/)[1]+'\n'+fs.readFileSync(path.join(root,'battle-addon.js'),'utf8'),context,{timeout:5000});
 const b=context.window.RTCGBattle;b.setAnimationScale(0);b.networkConfigure({role:'server',...hooks});return b;
};
