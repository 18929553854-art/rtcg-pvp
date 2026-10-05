/* 对战扩展：放在原 index.html 最后一个脚本结束标签之前。 */
(() => {
  'use strict';
  const BACKGROUNDS=[{id:'default',name:'默认背景'},...Array.from({length:5},(_,i)=>({id:'background-'+(i+1),name:'背景 '+(i+1),available:true,file:'battle-background-'+(i+1)+'.png'}))];
  const SLEEVES=[{id:'default',name:'默认卡背',file:'card-back.png'},...Array.from({length:5},(_,i)=>({id:'sleeve-'+(i+1),name:'卡套 '+(i+1),file:'card-sleeve-'+(i+1)+'.png'}))];
  const sleeveId=id=>SLEEVES.some(x=>x.id===id)?id:'default';
  let draftBackground='default',draftSleeve='default';
  const backgroundId=id=>BACKGROUNDS.some(b=>b.id===id&&(b.id==='default'||b.available))?id:'default';
  try{const stored=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');for(const d of savedDecks){const old=stored.decks?.find(x=>x.id===d.id);d.background=backgroundId(old?.background);d.sleeve=sleeveId(old?.sleeve);}}catch{}
  const oldNormalizeDeck=normalizeDeck;normalizeDeck=function(raw,id){const d=oldNormalizeDeck(raw,id);if(d){d.background=backgroundId(raw.background);d.sleeve=sleeveId(raw.sleeve);}return d;};
  const oldPersistDecks=persistDecks;persistDecks=function(next){return oldPersistDecks(next.map(d=>({...d,background:backgroundId(d.id===editingId||!editingId&&!savedDecks.some(x=>x.id===d.id)?draftBackground:d.background),sleeve:sleeveId(d.id===editingId||!editingId&&!savedDecks.some(x=>x.id===d.id)?draftSleeve:d.sleeve)})));};
  const oldStartEditor=startEditor;startEditor=function(d=null){const before=editingId;oldStartEditor(d);if(document.getElementById('editor').hidden||editingId!==(d?.id??null))return;draftBackground=backgroundId(d?.background);draftSleeve=sleeveId(d?.sleeve);document.getElementById('deckBackgrounds')?.remove();};
  function paintBackgrounds(){let section=document.getElementById('deckBackgrounds');if(!section){section=document.createElement('section');section.id='deckBackgrounds';document.getElementById('deckBackgroundDialog').append(section);}section.replaceChildren();const title=document.createElement('h3');title.textContent='配套背景';section.append(title);const grid=document.createElement('div');grid.className='deck-background-grid';
    for(const b of BACKGROUNDS){const button=document.createElement('button');button.type='button';button.className='deck-background-option'+(draftBackground===b.id?' selected':'');button.disabled=b.id!=='default'&&!b.available;button.setAttribute('aria-pressed',String(draftBackground===b.id));button.setAttribute('aria-label',b.name+(button.disabled?'，待添加':''));const preview=document.createElement('span');preview.className='deck-background-preview';
      if(b.available){const img=document.createElement('img');img.src='./'+encodeURIComponent(IMAGE_FOLDER)+'/'+encodeURIComponent(b.file);img.alt=b.name;img.onerror=()=>{img.remove();preview.textContent='请放入背景图片';};preview.append(img);}else preview.textContent=b.id==='default'?'✦':'＋';const label=document.createElement('span');label.textContent=b.name+(button.disabled?' · 待添加':'');button.append(preview,label);button.onclick=()=>{draftBackground=b.id;markDirty();paintBackgrounds();};grid.append(button);}section.append(grid);}
  function paintSleeves(){let section=document.getElementById('deckSleeves');if(!section){section=document.createElement('section');section.id='deckSleeves';backgroundDialog.append(section);}section.replaceChildren();section.append(el('h3','配套卡套'));const grid=el('div',undefined,'deck-sleeve-grid');
    for(const item of SLEEVES){const option=el('button',undefined,'deck-sleeve-option'+(draftSleeve===item.id?' selected':''));option.type='button';option.setAttribute('aria-label',item.name);option.setAttribute('aria-pressed',String(draftSleeve===item.id));const preview=el('span',undefined,'deck-sleeve-preview'),img=el('img');img.src='./'+encodeURIComponent(IMAGE_FOLDER)+'/'+encodeURIComponent(item.file);img.alt='';img.onerror=()=>{img.remove();preview.append(el('span','＋'),el('small','图片待补'));};preview.append(img);option.append(preview,el('span',item.name));option.onclick=()=>{draftSleeve=item.id;markDirty();paintSleeves();};grid.append(option);}section.append(grid);}
  const backgroundDialog=document.createElement('dialog');backgroundDialog.id='deckBackgroundDialog';document.body.append(backgroundDialog);
  document.getElementById('saveDeck').addEventListener('click',event=>{event.preventDefault();event.stopImmediatePropagation();if(ruleErrors().length||editingId===null&&savedDecks.length>=MAX_DECKS){saveDeck();return;}backgroundDialog.replaceChildren();paintBackgrounds();paintSleeves();const controls=document.createElement('div');controls.className='background-save-actions';const cancel=document.createElement('button');cancel.type='button';cancel.textContent='返回选卡';cancel.onclick=()=>backgroundDialog.close();const confirm=document.createElement('button');confirm.type='button';confirm.textContent='确认并保存';confirm.className='primary';confirm.onclick=()=>{saveDeck();if(!dirty)backgroundDialog.close();};controls.append(cancel,confirm);backgroundDialog.append(controls);backgroundDialog.showModal();},true);
  const ADVANCED_BALL_TEXT='投掷1次硬币，如果是正面，则从卡组中选出1只一阶精灵，展示后加入手牌，然后重洗卡组。';
  const advancedBall=cardById.get(makeId(41));if(advancedBall)advancedBall.effect=ADVANCED_BALL_TEXT;
  const RULES = { magic:3, bench:3, opening:5, weakness:20,
    firstPlayerNoEnergy:true, firstPlayerNoAttack:false,
    randomMixedEnergy:true, turnLimit:200 };
  const deck = (name,energy,entries) => ({id:'default-'+energy,name,
    isDefault:true,energies:[energy+'属性能量'],
    cards:entries.map(([n,count])=>({id:makeId(n),count}))});
  const common = [[31,2],[35,2],[40,2],[41,2]];
  const DEFAULTS = [
    deck('草系 · 魔力猫ex恢复流','草',[[1,2],[2,2],[4,2],[5,2],[6,2],...common,[38,2]]),
    deck('火系 · 火神ex爆发流','火',[[7,2],[8,2],[10,2],[11,2],[12,2],...common,[45,2]]),
    deck('水系 · 水灵ex能量增效流','水',[[13,2],[14,2],[16,2],[17,2],[18,2],...common,[39,2]]),
    deck('电系 · 噼啪鸟ex与利灯鱼','电',[[22,2],[23,2],[24,2],...common,[46,2],[34,1],[37,1],[44,1],[33,1]]),
    deck('斗系 · 罗隐ex与绒光优优','斗',[[25,2],[26,2],[28,2],[29,2],[30,2],...common,[47,1],[44,1]])
  ];
  // cost 中“无”表示任意能量；技能名与原卡牌数据一一对应。
  const SKILLS = {
    '藤绞': ['草,无',40], '盛开':['草',0,'grow'],
    '光能聚集':['草,草,草,无',30,'grassDamage'],
    '筛管奔流':['草,草,草,无',120,'heal20'],
    '种子弹':['草',20], '叶绿光束':['草,草,草',80],
    '火苗':['火',30,'discard1'], '闪燃':['火',20], '焚毁':['火,火',40],
    '火云车':['火,火,无,无',150,'discard2'],
    '吹火':['火',30,'growFire'], '山火':['火,火,无,无',200,'discard2'],
    '当头棒喝':['无',20,'entered'], '流星火雨':['火,火',60],
    '甩水':['水',20], '涌泉':['水,水',50], '气泡':['水,水,水',80],
    '天洪':['水,水,水,水,水',140], '翼击':['无,无',40],
    '回旋风暴':['无,无,无',90], '闪击折返':['电',20,'switch'],
    '球状闪电':['电,电',50], '感电':['电,无,无',100,'transfer'],
    '交叉闪电':['电,电,无,无',120], '落雷':['电,电',40,'discardDamage'],
    '超导加速':['电,无',50], '加大功率':['电,无,无',0,'recycleSwitch'],
    '扔泥':['斗',20], '地刺':['斗,斗',40],
    '鸣沙陷阱':['斗,斗,无',30,'energyDamage'],
    '岩土暴击':['斗,斗,斗',20,'hurtDamage'], '泥巴射击':['斗',20]
  };
  for(const [name,d] of Object.entries(CARD_SKILL_DEFINITIONS)){if(SKILLS[name]){SKILLS[name][0]=d[0];SKILLS[name][1]=d[1];}else SKILLS[name]=[d[0],d[1],'a1'];}
  const ACTIVE_ABILITIES=['氧循环','最好的伙伴','绒粉星光','莫比乌斯'];
  const num=id=>id.startsWith('A0-')?Number(id.slice(3)):-1;
  let game=null, serial=0, busy=false, generation=0, chooser=null;
  let scene=null, targetChoice=null, selectedTarget=null, speed=1, aiTimer=null, paintedTurn=null,backgroundWipe=null,networkHooks=null,networkSearchCards=null;
  const artNodes=new Map();
  const sleep=ms=>speed===0?Promise.resolve():new Promise(r=>setTimeout(r,ms*speed));
  const SKILL_TEXT={
    grow:'从能量区抽出2个草能量附在自身。',grassDamage:'每个附着的草能量增加20伤害。',
    heal20:'攻击后回复20HP。',discard1:'使用后丢弃自身1个火能量。',discard2:'使用后丢弃自身2个火能量。',
    growFire:'从能量区抽出1个火能量附在自身。',entered:'本回合从备战区进入战斗区时，额外造成40伤害。',
    switch:'使用后与自己1只备战精灵交换。',transfer:'使用后可将自身任意数量的能量移动到1只备战精灵。',
    discardDamage:'弃牌区每个电能量增加20伤害。',recycleSwitch:'将弃牌区最多2个能量附给1只备战精灵，然后与它交换。',
    energyDamage:'自身每个附着能量增加20伤害。',hurtDamage:'增加与自身已经受到的伤害相同的伤害。'
  };
  const ABILITY_TEXT={氧循环:'每回合一次，选择1只己方草精灵回复30HP。',
    腐植循环:'从能量区附能后，自身回复20HP。',浸润:'己方水精灵的每个水能量视为2个；不会叠加。',
    水翼推进:'技能的无属性需求减少弃牌区水能量的数量。',快充:'在自己的回合，从备战区进入战斗区时，可将己方场上任意数量的能量移动到自身。',
    哨兵:'每次从备战区进入战斗区时，对任意1只对方精灵造成20伤害。'};
  const el = (tag,text,cls) => {const x=document.createElement(tag);
    if(text!==undefined)x.textContent=text;if(cls)x.className=cls;return x;};
  const actionButton=(text,fn,disabled=false)=>{const x=button(text,fn);x.disabled=disabled;return x;};
  const clone=x=>JSON.parse(JSON.stringify(x));
  const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  const random=a=>a[Math.floor(Math.random()*a.length)];
  const card=id=>cardById.get(id);
  const info=m=>{const c=card(m.id);return c&&m.tool&&card(m.tool)?.name==='精灵护符'?{...c,hp:c.hp+20}:c;};
  const mons=p=>[p.active,...p.bench].filter(Boolean);
  const count=(a,t)=>a.filter(x=>x===t).length;
  const energyType=x=>x.replace('属性能量','').replace('无能量','无');
  function log(s){game.log.push(s);if(game.log.length>250)game.log.shift();}
  function createMon(id,p){return {uid:++serial,id,stack:[id],damage:0,energy:[],
    born:p.turns,evolved:-1,entered:-1,status:[]};}
  function draw(p,n){for(let i=0;i<n&&p.deck.length;i++)p.hand.push(p.deck.shift());}
  async function beat(type,title,extra={},duration=600){
    const token=generation;
    if(networkHooks?.role==='server'){await networkHooks.event({type,title,...extra,duration});return;}
    if(type==='coin'&&speed>0&&window.requestAnimationFrame)await preloadCoins();
    if(token!==generation)throw new Error('对局已结束');
    scene={type,title,...extra,started:Date.now(),duration:duration*speed};render();await sleep(duration);
    if(token!==generation)throw new Error('对局已结束');scene=null;render();
  }
  async function tossCoin(title,extra={}){const head=Math.random()<.5;
    await beat('coin',title,{toss:true,landing:head?'正':'反',...extra},1800);return head;}
  const loadedArtImages=new Map(),backNodes=new Map(),backgroundNodes=new Map();
  const originalLoadImage=loadImage;
  loadImage=function(name,host){const ready=loadedArtImages.get(name);if(ready){host.replaceChildren(ready.cloneNode(true));return;}
    originalLoadImage(name,host);if(typeof MutationObserver==='undefined')return;const observer=new MutationObserver(()=>{const img=host.querySelector('img');if(img&&img.complete&&img.naturalWidth){loadedArtImages.set(name,img.cloneNode(true));observer.disconnect();}else if(host.textContent.startsWith('未找到卡图'))observer.disconnect();});observer.observe(host,{childList:true});};
  const SPECIAL_STATUS={中毒:{icon:'☠',color:'#a568cc'},灼伤:{icon:'♨',color:'#ea7e37'},睡眠:{icon:'Zz',color:'#688cca'},麻痹:{icon:'ϟ',color:'#d8b326'},混乱:{icon:'↻',color:'#bd76bc'}};
  function clearStatus(m){m.status=[];delete m.paralysisUntil;delete m.lullaby;delete m.attackLock;delete m.protectedUntil;delete m.protectedFrom;}
  function applyStatus(owner,uid,type){const p=game?.players[owner],m=p?.active;if(!m||m.uid!==uid||!SPECIAL_STATUS[type]||aura('陨落'))return false;
    if(['睡眠','麻痹','混乱'].includes(type))m.status=m.status.filter(t=>!['睡眠','麻痹','混乱'].includes(t));
    if(!m.status.includes(type))m.status.push(type);if(type==='麻痹')m.paralysisUntil=p.turns+1;
    log(info(m).name+'陷入'+type+'。');render();return true;}
  function removeStatus(m,type){m.status=m.status.filter(t=>t!==type);if(type==='麻痹')delete m.paralysisUntil;}
  async function statusCheckup(endingOwner){for(const owner of [endingOwner,1-endingOwner]){const p=game.players[owner],m=p.active;if(!m)continue;
    for(const type of ['中毒','灼伤','睡眠','麻痹']){if(!m.status.includes(type))continue;
      if(type==='中毒'||type==='灼伤'){const amount=damageProtected(m)?0:(type==='中毒'?10:20)+auraCount('双向光束')*10+(type==='中毒'?mons(game.players[1-owner]).filter(x=>info(x).ability==='复方汤剂').length*10:0);if(amount){m.damage+=amount;log(info(m).name+'因'+type+'受到'+amount+'伤害。');await beat('damage',type,{target:m.uid,amount:String(amount),statusType:type},800);}}
      if(type==='灼伤'||type==='睡眠'){if(await tossCoin(type,{target:m.uid,statusType:type})){removeStatus(m,type);log(info(m).name+'解除'+type+'。');await beat('statusRecover',type,{target:m.uid,statusType:type},450);}}
      if(type==='麻痹'&&owner===endingOwner&&p.turns>=(m.paralysisUntil??p.turns)){removeStatus(m,type);log(info(m).name+'解除麻痹。');await beat('statusRecover',type,{target:m.uid,statusType:type},450);}
    }}await resolveKO();render();}
  async function finishTurn(owner){for(const m of mons(game.players[owner])){if(m.lullaby<=game.players[owner].turns)delete m.lullaby;if(m.attackLock<=game.players[owner].turns)delete m.attackLock;}await statusCheckup(owner);if(!game.winner)await beginTurn(1-owner);}
  async function opponentPlayFlight(id,index,destination=null){if(speed===0||!window.requestAnimationFrame)return;
    const from=arena.querySelectorAll('.mini-back')[index]?.getBoundingClientRect(),board=arena.querySelector('#battleTable')?.getBoundingClientRect();if(!from||!board)return;
    const h=Math.min(board.height*.53,window.innerHeight*.5),w=h*5/7,x=board.x+(board.width-w)/2,y=board.y+(board.height-h)/2,token=generation;
    const ghost=el('div',undefined,'opponent-play-flight');ghost.append(artwork(card(id),'opponent-play-'+id));Object.assign(ghost.style,{width:w+'px',height:h+'px'});document.body.append(ghost);
    const frames=[{transform:`translate(${from.x+(from.width-w)/2}px,${from.y+(from.height-h)/2}px) scale(${from.width/w}) rotate(-8deg)`,opacity:.4,offset:0},{transform:`translate(${x}px,${y}px) scale(1) rotate(0deg)`,opacity:1,offset:.28},{transform:`translate(${x}px,${y}px) scale(1) rotate(0deg)`,opacity:1,offset:destination?.72:1}];
    if(destination)frames.push({transform:`translate(${destination.x+(destination.width-w)/2}px,${destination.y+(destination.height-h)/2}px) scale(${destination.width/w}) rotate(0deg)`,opacity:1,offset:1});
    const motion=ghost.animate(frames,{duration:1350*speed,easing:'cubic-bezier(.25,.65,.3,1)',fill:'forwards'});try{await sleep(1350);if(token!==generation)throw new Error('对局已结束');}finally{motion.cancel();ghost.remove();}}
  async function usedCardDiscard(owner,id){const p=game.players[owner],token=generation;
    if(networkHooks?.role==='server'){await networkHooks.event({type:'usedDiscard',owner,cardId:id,duration:500});p.discard.push(id);return;}if(speed===0||!window.requestAnimationFrame){p.discard.push(id);render();return;}
    const board=arena.querySelector('#battleTable')?.getBoundingClientRect(),target=arena.querySelector('[data-anchor="discard-'+owner+'"]')?.getBoundingClientRect();
    if(!board||!target){p.discard.push(id);render();return;}
    const h=Math.min(board.height*.53,window.innerHeight*.5),w=h*5/7,x=board.x+(board.width-w)/2,y=board.y+(board.height-h)/2;
    const ghost=el('div',undefined,'used-card-discard-flight');ghost.append(artwork(card(id),'used-discard'));Object.assign(ghost.style,{position:'fixed',left:x+'px',top:y+'px',width:w+'px',height:h+'px',zIndex:'105',pointerEvents:'none'});document.body.append(ghost);
    const motion=ghost.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${(target.x-x)*.45}px,${(target.y-y)*.45-35}px) scale(.7) rotate(8deg)`,opacity:1},{transform:`translate(${target.x-x+(target.width-w)/2}px,${target.y-y+(target.height-h)/2}px) scale(${target.width/w}) rotate(0deg)`,opacity:1}],{duration:500*speed,easing:'ease-in-out',fill:'forwards'});
    try{await sleep(500);if(token!==generation)throw new Error('对局已结束');p.discard.push(id);}finally{motion.cancel();ghost.remove();}render();
  }
  async function animatedDraw(owner,n,durationMs=1450,selectedIndex=null,reveal=false){const p=game.players[owner];
    for(let i=0;i<n&&p.deck.length;i++){
      if(networkHooks?.role==='server')await networkHooks.event({type:'networkDraw',owner,cardId:selectedIndex===null?p.deck[0]:p.deck[selectedIndex],reveal,duration:durationMs});
      const token=generation,id=selectedIndex===null?p.deck.shift():p.deck.splice(selectedIndex,1)[0];if(speed===0||!window.requestAnimationFrame){p.hand.push(id);continue;}
      const source=arena.querySelector('[data-anchor="deck-'+owner+'"]')?.getBoundingClientRect();
      const oldHands=[...arena.querySelectorAll('.hand-card')].map(n=>n.getBoundingClientRect());
      const current={type:'drawFlight',owner,cardId:owner===0?id:null};scene=current;render();
      const tray=arena.querySelector('.hand-tray');if(owner===0&&tray)tray.scrollLeft=tray.scrollWidth;
      const destination=arena.querySelector('.draw-destination')?.getBoundingClientRect();
      if(!source||!destination){scene=null;p.hand.push(id);render();continue;}
      const flight=el('div',undefined,'draw-flight'),flipper=el('div',undefined,'draw-flipper'),back=el('div',undefined,'draw-face draw-back');back.append(cardBack('flight-back',owner));flipper.append(back);
      if(owner===0||reveal){const front=el('div',undefined,'draw-face draw-front');front.append(artwork(card(id),'flight-front'));flipper.append(front);}flight.append(flipper);
      flight.style.width=destination.width+'px';flight.style.height=destination.height+'px';document.body.append(flight);
      const sx=source.x+source.width/2-destination.width/2,sy=source.y+source.height/2-destination.height/2,dx=destination.x,dy=destination.y;
      const board=arena.querySelector('#battleTable').getBoundingClientRect(),mx=board.x+board.width/2-destination.width/2,my=board.y+board.height*.55-destination.height/2;
      const duration=durationMs*speed,startScale=source.width/destination.width,showScale=Math.min(board.height*.65,window.innerHeight*.6)/destination.height;
      const motion=flight.animate([{transform:`translate(${sx}px,${sy}px) scale(${startScale}) rotate(0deg)`,offset:0},{transform:`translate(${sx+12}px,${sy-30}px) scale(${startScale*1.1}) rotate(-8deg)`,offset:.16},{transform:`translate(${mx}px,${my}px) scale(${owner===0||reveal?showScale:1.25}) rotate(0deg)`,offset:.3},{transform:`translate(${mx}px,${my}px) scale(${owner===0||reveal?showScale:1.25}) rotate(0deg)`,offset:.74},{transform:`translate(${dx}px,${dy-25}px) scale(1.12) rotate(3deg)`,offset:.82},{transform:`translate(${dx}px,${dy}px) scale(1) rotate(0deg)`,offset:1}],{duration,easing:'cubic-bezier(.25,.65,.3,1)',fill:'forwards'});
      if(owner===0||reveal)flipper.animate([{transform:'rotateY(0deg)'},{transform:'rotateY(180deg)'}],{delay:duration*.12,duration:duration*.22,easing:'ease-in-out',fill:'forwards'});
      if(owner===0)arena.querySelectorAll('.hand-card:not(.draw-destination)').forEach((node,j)=>{const old=oldHands[j],now=node.getBoundingClientRect();if(old)node.animate([{transform:`translate(${old.x-now.x}px,${old.y-now.y}px)`},{transform:'translate(0,0)'}],{duration:duration*.45,easing:'ease-out'});});
      try{await sleep(durationMs);if(token!==generation)throw new Error('对局已结束');p.hand.push(id);}
      finally{motion.cancel();flight.remove();if(scene===current)scene=null;}
      render();const landed=owner===0?arena.querySelector('.hand-card:last-child'):arena.querySelector('.mini-back:last-child');if(landed)landed.animate([{transform:'scale(1.06)'},{transform:'scale(1)'}],{duration:180*speed,easing:'ease-out'});
    }}
  async function openingDeal(){if(speed===0||!window.requestAnimationFrame){for(const p of game.players)draw(p,5);render();return;}
    const token=generation,current={type:'openingDeal'};scene=current;render();const ghosts=[],animations=[];
    try{for(const owner of [0,1]){const p=game.players[owner],source=arena.querySelector('[data-anchor="deck-'+owner+'"]')?.getBoundingClientRect(),spaces=arena.querySelectorAll('[data-deal-owner="'+owner+'"]');
      for(let i=0;i<5;i++){const id=p.deck.shift(),dest=spaces[i]?.getBoundingClientRect();p.hand.push(id);if(!source||!dest)continue;
        const ghost=el('div',undefined,'draw-flight opening-flight'),inner=el('div',undefined,'draw-flipper'),back=el('div',undefined,'draw-face draw-back');back.append(cardBack('opening-back-'+owner+'-'+i,owner));inner.append(back);
        if(owner===0){const front=el('div',undefined,'draw-face draw-front');front.append(artwork(card(id),'opening-front-'+i));inner.append(front);}ghost.append(inner);ghost.style.width=dest.width+'px';ghost.style.height=dest.height+'px';document.body.append(ghost);ghosts.push(ghost);
        const sx=source.x,sy=source.y,dx=dest.x,dy=dest.y,delay=i*75*speed,duration=480*speed;
        animations.push(ghost.animate([{transform:`translate(${sx}px,${sy}px) scale(${source.width/dest.width})`,opacity:0,offset:0},{transform:`translate(${sx}px,${sy-12}px) scale(1)`,opacity:1,offset:.12},{transform:`translate(${(sx+dx)/2}px,${(sy+dy)/2-35}px) scale(1.1)`,opacity:1,offset:.5},{transform:`translate(${dx}px,${dy}px) scale(1)`,opacity:1,offset:1}],{duration,delay,easing:'ease-out',fill:'both'}));
        if(owner===0)animations.push(inner.animate([{transform:'rotateY(0deg)'},{transform:'rotateY(180deg)'}],{duration:duration*.45,delay:delay+duration*.2,fill:'both'}));
      }}await sleep(800);if(token!==generation)throw new Error('对局已结束');
    }finally{animations.forEach(a=>a.cancel());ghosts.forEach(g=>g.remove());if(scene===current)scene=null;}render();}
  async function evolveFlight(owner,m,id,index){if(networkHooks?.role==='server'){await networkHooks.event({type:'networkEvolve',owner,target:m.uid,cardId:id,index,duration:1800});return;}if(speed===0||!window.requestAnimationFrame)return;
    const target=arena.querySelector('[data-uid="'+m.uid+'"]'),dest=target?.getBoundingClientRect();if(!dest)return;
    const current={type:'evolveFlight'},token=generation;scene=current;const old=el('div',undefined,'draw-flight evolution-original'),next=el('div',undefined,'draw-flight evolve-flight evolution-new'),burst=el('div',undefined,'evolution-burst');
    old.append(artwork(info(m),'evolve-original'));next.append(artwork(card(id),'evolve-new'));for(const node of [old,next]){node.style.width=dest.width+'px';node.style.height=dest.height+'px';document.body.append(node);}burst.style.left=(dest.x+dest.width/2-160)+'px';burst.style.top=(dest.y+dest.height/2-215)+'px';document.body.append(burst);target.style.visibility='hidden';
    const lift=old.animate([{transform:`translate(${dest.x}px,${dest.y}px) rotateY(0deg) scale(1)`,filter:'brightness(1)',opacity:1,offset:0},{transform:`translate(${dest.x}px,${dest.y-65}px) rotateY(0deg) scale(1.15)`,filter:'brightness(1)',opacity:1,offset:.2},{transform:`translate(${dest.x}px,${dest.y-65}px) rotateY(1080deg) scale(1.22)`,filter:'brightness(1.5)',opacity:1,offset:.82},{transform:`translate(${dest.x}px,${dest.y-65}px) rotateY(1080deg) scale(1.2)`,filter:'brightness(6)',opacity:0,offset:1}],{duration:1100*speed,easing:'ease-in-out',fill:'forwards'});
    const flash=burst.animate([{opacity:0,transform:'scale(.2)',offset:0},{opacity:1,transform:'scale(1.15)',offset:.35},{opacity:0,transform:'scale(1.5)',offset:1}],{delay:850*speed,duration:650*speed,fill:'both',easing:'ease-out'});
    const landing=next.animate([{transform:`translate(${dest.x}px,${dest.y-65}px) scale(1.2)`,filter:'brightness(3)',opacity:0,offset:0},{transform:`translate(${dest.x}px,${dest.y-45}px) scale(1.13)`,filter:'brightness(1.3)',opacity:1,offset:.3},{transform:`translate(${dest.x}px,${dest.y}px) scale(1)`,filter:'brightness(1)',opacity:1,offset:1}],{delay:1100*speed,duration:650*speed,fill:'both',easing:'ease-out'});
    try{await sleep(1800);if(token!==generation)throw new Error('对局已结束');}finally{[lift,flash,landing].forEach(a=>a.cancel());[old,next,burst].forEach(n=>n.remove());target.style.visibility='';if(scene===current)scene=null;}}
  async function placeOpponentBench(index){const p=game.players[1],id=p.hand[index];if(!id||card(id).stage!=='基础'||p.bench.length>=RULES.bench)return false;
    const source=arena.querySelectorAll('.mini-back')[index]?.getBoundingClientRect(),m=createMon(p.hand.splice(index,1)[0],p);putBench(p,m);render();
    if(speed>0&&window.requestAnimationFrame){const token=generation,current={type:'setupBenchFlight'};scene=current;const dest=arena.querySelector('[data-uid="'+m.uid+'"]')?.getBoundingClientRect();
      if(source&&dest){const ghost=el('div',undefined,'draw-flight setup-bench-flight'),inner=el('div',undefined,'draw-flipper'),back=el('div',undefined,'draw-face draw-back'),front=el('div',undefined,'draw-face draw-front');back.append(cardBack('bench-flight-back',1));front.append(artwork(card(id),'bench-flight-front'));inner.append(back,front);ghost.append(inner);ghost.style.width=dest.width+'px';ghost.style.height=dest.height+'px';document.body.append(ghost);
        const flight=ghost.animate([{transform:`translate(${source.x}px,${source.y}px) scale(${source.width/dest.width}) rotate(-7deg)`},{transform:`translate(${dest.x}px,${dest.y-20}px) scale(1.08) rotate(0deg)`},{transform:`translate(${dest.x}px,${dest.y}px) scale(1) rotate(0deg)`}],{duration:600*speed,fill:'forwards',easing:'ease-in-out'}),flip=inner.animate([{transform:'rotateY(0deg)'},{transform:'rotateY(180deg)'}],{delay:150*speed,duration:300*speed,fill:'forwards'});
        try{await sleep(650);if(token!==generation)throw new Error('对局已结束');}finally{flight.cancel();flip.cancel();ghost.remove();if(scene===current)scene=null;}
      }else scene=null;
    }m.setupShown=true;log('对手放置备战精灵：'+info(m).name+'。');render();return true;}
  function recordContribution(owner,m,amount,victim){const stats=game.contributions||(game.contributions=[{},{}]),entry=stats[owner][m.uid]||(stats[owner][m.uid]={uid:m.uid,id:m.id,damage:0,kos:0,uses:0});entry.id=m.id;entry.damage+=Math.max(0,amount);entry.uses++;if(amount>0&&amount>=info(victim).hp-victim.damage)entry.kos++;}
  function standoutCard(owner=0){const entries=Object.values(game.contributions?.[owner]||{}).sort((a,b)=>b.damage-a.damage||b.kos-a.kos||b.uses-a.uses||a.uid-b.uid);if(entries.length)return card(entries[0].id);
    const p=game.players[owner];return p.active?info(p.active):p.bench.length?info(p.bench[0]):[...p.discard,...p.hand,...p.deck].map(card).find(c=>c?.category==='精灵');}
  function renderBattleResult(){if(networkHooks?.role==='client'&&$('battlePage').hidden){resultOverlay.hidden=true;return;}if(!game?.winner){arena.inert=false;resultOverlay.hidden=true;resultSignature='';return;}const outcome=game.winner===game.players[0].label+'获胜'?'victory':game.winner===game.players[1].label+'获胜'?'defeat':'draw',stage=game.resultStage||'verdict',key=generation+':'+outcome+':'+stage;
    arena.inert=true;resultOverlay.hidden=false;if(resultSignature===key){resultOverlay.querySelectorAll('.result-return').forEach(b=>b.disabled=busy);return;}resultSignature=key;resultOverlay.className='battle-result-layer result-'+outcome;resultOverlay.replaceChildren();
    const panel=el('div',undefined,'result-panel'),title=el('h1',outcome==='victory'?'胜利':outcome==='defeat'?'败北':'平局','result-title');panel.append(title,el('p','对手 · '+game.players[1].label,'result-opponent'));
    if(stage==='verdict'){const team=el('div',undefined,'result-team'),owner=outcome==='defeat'?1:0,p=game.players[owner],list=mons(p).slice(0,3);if(!list.length){const c=standoutCard(owner);if(c)list.push({id:c.id});}
      list.forEach((m,i)=>{const art=el('div',undefined,'result-team-card');art.style.setProperty('--card-order',i);art.append(artwork(info(m),'result-team-'+i));team.append(art);});panel.append(team);
      if(outcome==='victory'){const sparks=el('div',undefined,'result-sparks');for(let i=0;i<18;i++){const spark=el('span','✦');spark.style.setProperty('--spark',i);sparks.append(spark);}panel.append(sparks);}
      panel.append(actionButton('点击继续',()=>{game.resultStage='summary';renderBattleResult();}));
    }else {panel.append(el('h2','表现亮眼的卡牌','result-card-heading'));const c=standoutCard(0);if(c){const art=el('button',undefined,'result-mvp-card');art.type='button';art.setAttribute('aria-label','查看'+c.name);art.append(artwork(c,'result-mvp'));art.onclick=()=>inspectCard(c,0,null,null,true);panel.append(art);}
      const grid=el('dl',undefined,'result-stats'),damage=Object.values(game.contributions?.[0]||{}).reduce((sum,x)=>sum+x.damage,0);
      for(const [name,value] of [['先后手',game.first===0?'先手':'后手'],['对局回合',String(game.totalTurns)],['剩余魔力',game.players[0].magic+' : '+game.players[1].magic],['造成伤害',String(damage)]])grid.append(el('dt',name),el('dd',value));panel.append(grid);
      const hearts=el('div',undefined,'result-hearts');hearts.append(magicLabel(game.players[0]),el('span','／'),magicLabel(game.players[1]));panel.append(hearts);
      const back=actionButton('返回选卡',()=>{if(networkHooks?.role==='client'){resultOverlay.hidden=true;networkHooks.finishRoom();return;}generation++;if(aiTimer!==null)clearTimeout(aiTimer);aiTimer=null;scene=null;targetChoice=null;game=null;resultOverlay.hidden=true;arena.inert=false;showPage('battleSetup');},busy);back.className='result-return';panel.append(back);
    }resultOverlay.append(panel);}
  function snapshot(){return game.players.flatMap((p,owner)=>mons(p).map(m=>({uid:m.uid,owner,id:m.id,damage:m.damage,energy:m.energy.length})));}
  async function showChanges(before,showDamage=true){for(const old of before){const m=byUid(game.players[old.owner],old.uid);if(!m)continue;
    const difference=m.energy.length-old.energy;if(difference>0)await attachFlight(old.owner,m,m.energy.slice(old.energy));
    if(showDamage&&m.damage>old.damage)await beat('damage',info(m).name+'受到'+(m.damage-old.damage)+'伤害',{target:m.uid,amount:String(m.damage-old.damage)},700);
    if(m.damage<old.damage)await beat('heal',info(m).name+'回复'+(old.damage-m.damage)+'HP',{target:m.uid,amount:'+'+(old.damage-m.damage)},800);}
    for(const p of game.players)delete p.effectEnergies;render();}
  async function attachFlight(owner,m,types){if(networkHooks?.role==='server'){await networkHooks.event({type:'networkAttach',owner,target:m.uid,types,duration:600});return;}if(speed===0||!window.requestAnimationFrame)return;
    const current={type:'attachFlight',target:m.uid,added:types.length};scene=current;render();const source=arena.querySelector('[data-anchor="energy-'+owner+'"]')?.getBoundingClientRect(),target=arena.querySelector('[data-uid="'+m.uid+'"]')?.getBoundingClientRect();
    if(!source||!target){scene=null;render();return;}const ghosts=[],motions=[],token=generation;
    try{types.forEach((type,i)=>{const ghost=el('div',undefined,'attach-energy-flight');ghost.append(energyChip(type));document.body.append(ghost);ghosts.push(ghost);const sx=source.x+source.width/2-17,sy=source.y+source.height/2-17,tx=target.x+target.width/2-17,ty=target.y+target.height/2-17;
      motions.push(ghost.animate([{transform:`translate(${sx}px,${sy}px) scale(1)`,opacity:1},{transform:`translate(${(sx+tx)/2}px,${(sy+ty)/2-45}px) scale(1.35)`,opacity:1,offset:.45},{transform:`translate(${tx}px,${ty}px) scale(1.7)`,opacity:1,offset:.8},{transform:`translate(${tx}px,${ty}px) scale(.2)`,opacity:0}],{duration:600*speed,delay:i*80*speed,fill:'forwards',easing:'ease-in-out'}));});await sleep(600+(types.length-1)*80);if(token!==generation)throw new Error('对局已结束');
    }finally{motions.forEach(a=>a.cancel());ghosts.forEach(n=>n.remove());if(scene===current)scene=null;}render();
    const node=arena.querySelector('[data-uid="'+m.uid+'"]');node?.animate([{filter:'brightness(1.7)',boxShadow:'0 0 32px #8cf2ff',transform:'scale(1.04)'},{filter:'brightness(1)',boxShadow:'0 0 0 transparent',transform:'scale(1)'}],{duration:350*speed});}
  async function forcedSwitch(p,target,retreat=false){if(!target)return;if(networkHooks?.role==='server')await networkHooks.event({type:'networkSwitch',owner:game.players.indexOf(p),target:target.uid,retreat,duration:750});if(speed===0||!window.requestAnimationFrame){swap(p,target);return;}
    const old=p.active,a=arena.querySelector('[data-uid="'+old.uid+'"]'),b=arena.querySelector('[data-uid="'+target.uid+'"]');if(!a||!b){swap(p,target);return;}
    const ar=a.getBoundingClientRect(),br=b.getBoundingClientRect(),token=generation,current={type:'forcedSwitchFlight'};scene=current;const ghosts=[],motions=[];a.style.visibility='hidden';b.style.visibility='hidden';
    try{[[old,ar,br,-1],[target,br,ar,1]].forEach(([m,from,to,direction])=>{const ghost=el('div',undefined,'forced-switch-flight'+(retreat?' retreat-flight':''));ghost.append(artwork(info(m),'switch-flight-'+m.uid));ghost.style.width=from.width+'px';ghost.style.height=from.height+'px';document.body.append(ghost);ghosts.push(ghost);motions.push(ghost.animate([{transform:`translate(${from.x}px,${from.y}px) scale(1) rotate(0deg)`},{transform:`translate(${(from.x+to.x)/2+direction*65}px,${(from.y+to.y)/2-35}px) scale(1.2) rotate(${direction*10}deg)`,offset:.5},{transform:`translate(${to.x+(to.width-from.width)/2}px,${to.y+(to.height-from.height)/2}px) scale(${to.width/from.width}) rotate(0deg)`}],{duration:750*speed,easing:'cubic-bezier(.3,.7,.3,1)',fill:'forwards'}));});await sleep(750);if(token!==generation)throw new Error('对局已结束');swap(p,target);
    }finally{motions.forEach(m=>m.cancel());ghosts.forEach(n=>n.remove());a.style.visibility='';b.style.visibility='';if(scene===current)scene=null;}render();}
  async function promoteBench(owner,m){if(networkHooks?.role==='server')await networkHooks.event({type:'networkPromote',owner,target:m.uid,duration:750});const p=game.players[owner];if(!m||!p.bench.includes(m))return;
    const source=arena.querySelector('[data-uid="'+m.uid+'"]'),destination=source?.closest('.table-zone')?.querySelector('.active-row .table-card');
    const from=source?.getBoundingClientRect(),to=destination?.getBoundingClientRect();let ghost,motion;const token=generation,current={type:'forcedSwitchFlight'};
    if(speed>0&&window.requestAnimationFrame&&from&&to){scene=current;source.style.visibility='hidden';ghost=el('div',undefined,'forced-switch-flight promotion-flight');ghost.append(artwork(info(m),'promotion-'+m.uid));ghost.style.width=from.width+'px';ghost.style.height=from.height+'px';document.body.append(ghost);
      motion=ghost.animate([{transform:`translate(${from.x}px,${from.y}px) scale(1)`,offset:0},{transform:`translate(${(from.x+to.x)/2}px,${(from.y+to.y)/2-40}px) scale(1.25) rotate(-5deg)`,offset:.5},{transform:`translate(${to.x+(to.width-from.width)/2}px,${to.y+(to.height-from.height)/2}px) scale(${to.width/from.width}) rotate(0deg)`,offset:1}],{duration:750*speed,easing:'cubic-bezier(.25,.7,.3,1)',fill:'forwards'});
      try{await sleep(750);if(token!==generation)throw new Error('对局已结束');}finally{motion.cancel();ghost.remove();source.style.visibility='';if(scene===current)scene=null;}}
    p.bench.splice(p.bench.indexOf(m),1);p.active=m;p.switchedAt=game.totalTurns;clearStatus(m);m.entered=p.turns;render();const landed=arena.querySelector('[data-uid="'+m.uid+'"]');if(speed>0&&landed?.animate)landed.animate([{filter:'brightness(1.5)',transform:'scale(1.04)'},{filter:'brightness(1)',transform:'scale(1)'}],{duration:220*speed});
  }
  function firstSlot(p){return [0,1,2].find(i=>!p.bench.some(m=>m.slot===i));}
  function putBench(p,m,slot=firstSlot(p)){m.slot=slot;p.bench.push(m);}
  function heal(m,n){m.damage=Math.max(0,m.damage-n);}
  function addEnergy(p,m,t,fromZone=true){if(!m)return;m.energy.push(t);
    if(fromZone&&info(m).ability==='腐植循环')heal(m,20);
    if(fromZone&&t==='幻'&&info(m).ability==='与星星同行'){const enemy=game.players[1-game.players.indexOf(p)].active;if(enemy)directHP(enemy,20);}}
  function auraCount(name){return game.players.reduce((n,p)=>n+mons(p).filter(m=>info(m).ability===name).length,0);}
  function aura(name){return auraCount(name)>0;}
  function refreshAuras(){if(aura('陨落'))for(const p of game.players)for(const m of mons(p)){m.status=[];delete m.paralysisUntil;}}
  function damageProtected(m){return m.protectedUntil>=game.totalTurns&&(m.protectedFrom??0)<=game.totalTurns;}
  function directHP(m,n){if(!m)return 0;if(damageProtected(m))return 0;m.damage+=n;return n;}

  async function insertEffectEnergy(owner,type,n,alreadyInserted=false){
    const p=game.players[owner];
    if(!alreadyInserted)p.effectEnergies=(p.effectEnergies||[]).concat(Array(n).fill(type));
    if(networkHooks?.role==='server'){await networkHooks.event({type:'networkEnergyInsert',owner,energy:type,count:n,duration:450});return;}
    render();const zone=arena.querySelector('[data-anchor="energy-'+owner+'"]');
    if(speed>0&&window.requestAnimationFrame&&zone?.animate){const motion=zone.animate([{transform:'scale(.8)',filter:'brightness(2)'},{transform:'scale(1.15)',filter:'brightness(1.5)',offset:.6},{transform:'scale(1)',filter:'brightness(1)'}],{duration:450*speed,easing:'ease-out'});try{await sleep(450);}finally{motion.cancel();}}
  }
  function gain(p,m,t,n){
    for(let i=0;i<n;i++)addEnergy(p,m,t);}
  async function extraAttach(owner,title,type,n,targets=mons(game.players[owner]),fromZone=true){
    const p=game.players[owner];targets=targets.filter(Boolean);if(!targets.length)return;
    if(fromZone)await insertEffectEnergy(owner,type,n);
    if(networkHooks?.role==='server'&&targets.length>1){const tokens=await networkHooks.allocate(owner,{title,options:monOptions(p,targets),allocation:true,type,tokens:Array(n).fill(null),optional:false});for(const uid of tokens)addEnergy(p,byUid(p,uid),type,fromZone);return;}
    if(targets.length===1||owner===1||!window.requestAnimationFrame){const target=targets.length===1?targets[0]:energyTarget(p,targets);if(fromZone)gain(p,target,type,n);else for(let i=0;i<n;i++)addEnergy(p,target,type,false);return;}
    const assignments=await new Promise(resolve=>{chooser=resolve;selectedTarget=null;targetChoice={title,options:monOptions(p,targets),allocation:true,type,tokens:Array(n).fill(null),picked:0};render();});
    for(const uid of assignments)addEnergy(p,byUid(p,uid),type,fromZone);
    log(title+'：分配了'+n+'个'+type+'能量。');
  }
  async function networkMovement(owner,title,donors,targets,singleTarget=false){const p=game.players[owner],items=donors.flatMap(m=>m.energy.map((type,index)=>({type,index,source:m.uid})));if(!items.length||!targets.length)return;const tokens=await networkHooks.allocate(owner,{title,options:monOptions(p,targets),allocation:true,movement:true,optional:true,singleTarget,items,tokens:items.map(()=>null)});if(!tokens)return;const selected=items.map((item,i)=>({...item,target:tokens[i]})).filter(item=>item.target!==null);if(selected.length)await networkHooks.event({type:'networkTransfer',owner,items:selected,duration:450});for(const donor of donors)selected.filter(item=>item.source===donor.uid).sort((a,b)=>b.index-a.index).forEach(item=>donor.energy.splice(item.index,1));selected.forEach(item=>byUid(p,item.target).energy.push(item.type));}
  function energySourceLabel(m){const p=game.players[0];if(p.active===m)return '战斗区';const slot=m.slot??p.bench.indexOf(m);return '备战'+(['左','中','右'][slot]||String(slot+1));}
  function highlightEnergySource(uid,on){arena.querySelector('[data-uid="'+uid+'"]')?.classList.toggle('energy-source-hover',on);}
  async function moveEnergyUI(title,donors,targets,singleTarget=false){const p=game.players[0],items=donors.flatMap(m=>m.energy.map((type,index)=>({type,index,source:m.uid})));if(!items.length||!targets.length)return;
    const assignments=await new Promise(resolve=>{chooser=resolve;selectedTarget=null;targetChoice={title,options:monOptions(p,targets),allocation:true,movement:true,optional:true,singleTarget,items,tokens:items.map(()=>null),picked:0};render();});
    if(!assignments)return;const selected=items.map((item,i)=>({...item,target:assignments[i]})).filter(item=>item.target!==null),ghosts=[],animations=[];
    if(speed>0&&window.requestAnimationFrame&&selected.length){try{for(const item of selected){const source=arena.querySelector('[data-uid="'+item.source+'"]')?.getBoundingClientRect(),target=arena.querySelector('[data-uid="'+item.target+'"]')?.getBoundingClientRect();if(!source||!target)continue;
      const ghost=el('div',undefined,'transfer-energy-flight');ghost.append(energyChip(item.type));document.body.append(ghost);ghosts.push(ghost);animations.push(ghost.animate([{transform:`translate(${source.x}px,${source.bottom-20}px) scale(1)`},{transform:`translate(${(source.x+target.x)/2}px,${(source.bottom+target.bottom)/2-35}px) scale(1.4)`},{transform:`translate(${target.x}px,${target.bottom-20}px) scale(1)`}],{duration:400*speed,fill:'forwards',easing:'ease-in-out'}));}await sleep(400);}finally{animations.forEach(a=>a.cancel());ghosts.forEach(g=>g.remove());}}
    for(const donor of donors)selected.filter(item=>item.source===donor.uid).sort((a,b)=>b.index-a.index).forEach(item=>donor.energy.splice(item.index,1));
    for(const item of selected)byUid(p,item.target).energy.push(item.type);if(selected.length)log(title+'：移动'+selected.length+'个能量。');render();}
  function allocateToken(index,uid){if(!targetChoice?.allocation||!targetChoice.options.some(o=>o.value===uid))return;
    if(targetChoice.singleTarget)targetChoice.tokens=targetChoice.tokens.map(value=>value===null?null:uid);targetChoice.tokens[index]=uid;targetChoice.picked=targetChoice.tokens.findIndex(x=>x===null);render();}
  function validDeck(d){return d&&Array.isArray(d.cards)&&Array.isArray(d.energies)&&
    new Set(d.cards.map(x=>x.id)).size===d.cards.length&&
    !ruleErrors(new Map(d.cards.map(x=>[x.id,x.count])),new Set(d.energies)).length;}
  function setupPlayer(d,label){const list=d.cards.flatMap(x=>Array(x.count).fill(x.id));
    // 等价于反复重洗直到开局5张中至少包含一张基础精灵。
    let hand;do{shuffle(list);hand=list.slice(0,RULES.opening);}
    while(!hand.some(id=>card(id).stage==='基础'));
    return {label,background:backgroundId(d.background),sleeve:sleeveId(d.sleeve),deck:list.slice(RULES.opening),hand,discard:[],discardEnergy:[],
      types:d.energies.map(energyType),forecast:random(d.energies.map(energyType)),active:null,bench:[],magic:RULES.magic,turns:0};}
  function effectiveEnergy(p,m){return m.energy.flatMap(t=>
    t==='水'&&info(m).attribute==='水'&&mons(p).some(x=>info(x).ability==='浸润')?[t,t]:[t]);}
  function costFor(p,m,name){let req=SKILLS[name][0]?SKILLS[name][0].split(','):[];
    let reduce=info(m).ability==='水翼推进'?count(p.discardEnergy,'水'):0;
    if(name==='钢铁翼轴'&&m.entered===p.turns)reduce+=2;
    if(name==='彼岸之手')reduce+=RULES.magic-p.magic;
    req=req.filter(t=>t!=='无'||reduce--<=0);if(m.lullaby===p.turns)req.push('无');return req;
  }
  function canAttack(p,m,name){if(!m||m.status.some(t=>t==='睡眠'||t==='麻痹')||m.attackLock===p.turns)return false;
    if(name==='疾风连袭'&&!p.bench.some(x=>info(x).skills.some(k=>k==='水刃'||k==='闪击')))return false;
    let energy=effectiveEnergy(p,m).slice();const req=costFor(p,m,name);for(const t of req.filter(x=>x!=='无')){const i=energy.indexOf(t);if(i<0)return false;energy.splice(i,1);}return energy.length>=count(req,'无');}
  function attackDamage(p,q,m,target,base){if(!target||base<=0)return 0;if(damageProtected(target))return 0;
    if(info(target).ability==='稀兽花宝'&&/ex|gx/i.test(info(m).name))return 0;
    let n=base;if(q.active===target){n+=p.buff||0;if(info(m).attribute==='斗')n+=p.fightBuff||0;if(/ex|gx/i.test(info(target).name)){n+=p.exBuff||0;if(info(m).ability==='月光审判')n+=30;}if(info(m).ability==='悲悯')n+=(RULES.magic-p.magic)*20;if(info(target).weakness===info(m).attribute)n+=RULES.weakness;}return n;}
  function damageFor(p,q,m,name){const [,base,effect]=SKILLS[name];let n=base;
    if(effect==='grassDamage')n+=count(m.energy,'草')*20;
    if(effect==='entered'&&m.entered===p.turns)n+=40;
    if(effect==='discardDamage')n+=count(p.discardEnergy,'电')*20;
    if(effect==='energyDamage')n+=m.energy.length*20;
    if(effect==='hurtDamage')n+=m.damage;
    if(name==='过曝')n+=new Set(m.energy).size*20;
    if(name==='草虫冲击'&&q.switchedAt===game.totalTurns)n+=50;
    if(name==='飓风')n+=p.bench.filter(x=>info(x).attribute==='无').length*20;
    if(name==='闪击'&&q.active)n+=Math.max(0,info(q.active).retreat)*30;
    if(name==='魔能爆')n+=m.energy.length*30;
    if(name==='粒子对撞'&&q.active?.damage>0)n+=40;
    return attackDamage(p,q,m,q.active,n);}
  async function discardEnergyIndices(p,m,indices){if(networkHooks?.role==='server'&&indices.length)await networkHooks.event({type:'networkEnergyDiscard',owner:game.players.indexOf(p),target:m.uid,indices,duration:700});const chosen=[...new Set(indices)].filter(i=>i>=0&&i<m.energy.length).sort((a,b)=>a-b);if(!chosen.length)return;
    const owner=game.players.indexOf(p),node=arena.querySelector('[data-uid="'+m.uid+'"]'),chips=node?.querySelectorAll('.energy-chips .energy-chip'),cardRect=node?.getBoundingClientRect(),destination=arena.querySelector('[data-anchor="discard-'+owner+'"]')?.getBoundingClientRect();
    const items=chosen.map(i=>({type:m.energy[i],rect:chips?.[i]?.getBoundingClientRect()||cardRect}));for(const i of chosen.slice().reverse())m.energy.splice(i,1);p.discardEnergy.push(...items.map(x=>x.type));
    if(speed===0||!window.requestAnimationFrame||!destination){render();return;}const current={type:'energyDiscardFlight',owner,target:m.uid},token=generation;scene=current;render();const ghosts=[],motions=[];
    try{items.forEach((item,i)=>{if(!item.rect)return;const r=item.rect,width=r.width<50?Math.max(18,r.width):22,ghost=el('div',undefined,'energy-discard-flight');ghost.dataset.energy=item.type;ghost.append(energyChip(item.type));ghost.style.width=width+'px';ghost.style.height=width+'px';document.body.append(ghost);ghosts.push(ghost);const sx=r.x+r.width/2-width/2,sy=r.y+r.height/2-width/2,tx=destination.x+destination.width/2-width/2,ty=destination.y+destination.height/2-width/2;
      motions.push(ghost.animate([{transform:`translate(${sx}px,${sy}px) scale(1)`,opacity:1},{transform:`translate(${sx}px,${sy-28}px) scale(1.35)`,opacity:1,offset:.18},{transform:`translate(${(sx+tx)/2}px,${(sy+ty)/2-38}px) scale(1.2)`,opacity:1,offset:.55},{transform:`translate(${tx}px,${ty}px) scale(.45)`,opacity:1,offset:.88},{transform:`translate(${tx}px,${ty}px) scale(.1)`,opacity:0}],{duration:560*speed,delay:i*65*speed,fill:'forwards',easing:'cubic-bezier(.3,.65,.35,1)'}));});await sleep(560+(items.length-1)*65);if(token!==generation)throw new Error('对局已结束');
      arena.querySelector('[data-anchor="discard-'+owner+'"]')?.animate([{boxShadow:'0 0 24px #a1dcff',transform:'scale(1.06)'},{boxShadow:'0 0 0 transparent',transform:'scale(1)'}],{duration:240*speed});
    }finally{motions.forEach(a=>a.cancel());ghosts.forEach(n=>n.remove());if(scene===current)scene=null;}render();}
  async function discardEnergy(p,m,t,n){const indices=[];m.energy.forEach((type,i)=>{if(type===t&&indices.length<n)indices.push(i);});await discardEnergyIndices(p,m,indices);}
  function allDecks(){return [...DEFAULTS.map(clone),...savedDecks.map(d=>({...clone(d),isDefault:false}))];}

  // 页面与菜单由扩展自动创建，无需手工改动原 HTML 结构。
  const css=el('style');css.textContent=`
    .battle-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}.battle-grid select{width:100%}
    .battle-preview{line-height:1.8;white-space:pre-line;margin-top:12px}.battle-actions{display:flex;flex-wrap:wrap;gap:10px;margin:16px 0}
    #battlePage{max-width:1100px;margin:auto}#battlePage .header{margin-bottom:12px}#battlePage .header h1{font-size:23px}
    .battle-top-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.battle-top-actions button{padding:8px 12px}
    .turn-strip{display:flex;gap:12px;justify-content:space-between;padding:10px 16px;border-radius:12px;background:#1d3046;margin-bottom:12px;font-size:14px}
    .battle-table{position:relative;overflow:hidden;border:1px solid #406b79;border-radius:24px;min-height:610px;padding:14px 100px;background:radial-gradient(ellipse at center,#284c56 0%,#142e3c 60%,#101f31 100%);box-shadow:inset 0 0 70px #091924}
    .battle-table:before{content:'';position:absolute;left:15%;right:15%;top:50%;height:1px;background:linear-gradient(90deg,transparent,#71a4b3,transparent);pointer-events:none}
    .table-zone{position:relative;display:flex;flex-direction:column;align-items:center;gap:10px;min-height:285px}
    .zone-meta{display:flex;align-items:center;justify-content:space-between;width:100%;font-size:12px;color:#b4d0db}
    .magic-dots{display:inline-flex;gap:5px;align-items:center}.magic-dot{width:13px;height:13px;border:1px solid #9f86bb;border-radius:50%;background:#a185df;box-shadow:0 0 9px #ac93e955}.magic-dot.empty{background:#1b2335;box-shadow:none;opacity:.55}
    .bench-row{display:grid;grid-template-columns:repeat(3,92px);gap:16px;justify-content:center;min-height:128px}.active-row{display:flex;justify-content:center;min-height:160px;width:100%}
    .table-card{position:relative;display:block;padding:0;width:92px;height:128px;border:1px solid #49697a;border-radius:9px;background:#163442;transition:box-shadow .2s,filter .2s;overflow:visible;text-align:left}
    .table-card.active{width:112px;height:156px;border-color:#91c3d1}.table-card.empty{border-style:dashed;background:#15313a55;display:flex;align-items:center;justify-content:center;color:#6d929f;text-align:center;font-size:12px}
    .table-card img{width:100%;height:100%;object-fit:contain;border-radius:8px}.table-art{height:100%;width:100%;overflow:hidden;border-radius:8px;background:linear-gradient(140deg,#254d53,#132434);display:flex;align-items:center;justify-content:center}
    .table-art .placeholder{font-size:11px;line-height:1.5;padding:8px;text-align:center;overflow-wrap:anywhere;background:transparent}
    .card-name{position:absolute;bottom:0;left:0;right:0;background:#091b2ceb;padding:3px 4px;font-size:10px;text-align:center;border-radius:0 0 8px 8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .hp-badge{position:absolute;top:-8px;right:-9px;z-index:2;background:#132533;border:1px solid #89bcc5;border-radius:8px;padding:2px 6px;font-size:17px;font-weight:bold;line-height:1.2}.hp-bar{height:3px;background:#091924;margin-top:3px;border-radius:4px;width:34px;overflow:hidden}.hp-bar span{display:block;height:100%;background:#65d6a2}
    .energy-chips{position:absolute;bottom:17px;left:4px;right:4px;display:flex;flex-wrap:wrap;gap:2px;pointer-events:none}.energy-chip{display:inline-flex;align-items:center;justify-content:center;width:19px;height:19px;border-radius:50%;background:var(--energy-color,#8194ad);border:1px solid #ffffff66;color:#091925;font-size:11px;font-weight:bold;box-shadow:0 1px 4px #0008}.ability-tag{position:absolute;top:5px;left:4px;color:#e5d0ff;background:#3b285be6;border-radius:4px;padding:2px 3px;font-size:9px}
    .targetable{box-shadow:0 0 0 3px #5fdfcf,0 0 25px #62ddd877;cursor:pointer;z-index:3}.target-selected{box-shadow:0 0 0 4px #ffe49a,0 0 30px #ffe49a88}.target-muted{filter:brightness(.45);pointer-events:none}
    .resource-rail{position:absolute;width:74px;display:flex;flex-direction:column;align-items:center;gap:10px}.rail-human{right:14px;bottom:40px}.rail-foe{left:14px;top:55px}
    .pile{height:67px;width:49px;background:repeating-linear-gradient(135deg,#183749,#183749 5px,#244e60 5px,#244e60 6px);border:2px solid #5c8da0;border-radius:7px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:12px;padding:3px;color:#c4dde7}.pile.discard{height:auto;min-height:40px;background:#173044;border-width:1px;font-size:11px}
    .zone-energy{position:relative;width:61px;height:61px;border-radius:50%;border:2px solid #96d4d7;background:#173d4d;display:flex;align-items:center;justify-content:center;box-shadow:0 0 18px #6adecb33}.zone-energy .energy-chip{width:38px;height:38px;font-size:20px}.zone-energy.used{opacity:.4}.forecast{position:absolute;bottom:-7px;right:-7px;border:2px solid #173746;border-radius:50%}.forecast .energy-chip{width:24px;height:24px;font-size:13px}.resource-label{font-size:10px;color:#9cbeca;text-align:center}
    .hand-backs{display:flex;justify-content:center;gap:2px;max-width:100%;height:20px;overflow:hidden;margin:2px 0 6px}.mini-back{width:14px;height:19px;border-radius:3px;background:#285b78;border:1px solid #729caf}
    .hand-tray{display:flex;gap:9px;overflow-x:auto;padding:18px 10px 10px;min-height:142px;scrollbar-width:thin;align-items:flex-end;background:#132231;border-radius:0 0 18px 18px}
    .hand-card{width:80px;height:111px;flex:0 0 80px;position:relative;padding:0;border-radius:8px;background:#1c3543;transition:transform .2s;overflow:visible}.hand-card.playable{border-color:#7fd9c4;box-shadow:0 -3px 9px #6cc9b733}.hand-card:hover{transform:translateY(-8px)}.hand-card img{width:100%;height:100%;object-fit:contain}.hand-card .table-art{border-radius:8px}.hand-card .card-name{font-size:10px}.hand-caption{font-size:12px;color:#aac3d4;margin:9px 0}
    .action-dock{display:flex;justify-content:space-between;align-items:center;gap:10px;min-height:54px;padding:10px 0;flex-wrap:wrap}.dock-help{font-size:13px;color:#b9d3df;flex:1}.dock-buttons{display:flex;gap:8px;flex-wrap:wrap}.dock-buttons button{padding:9px 13px}
    .selection-prompt{position:sticky;top:8px;z-index:8;background:#183946;border:1px solid #81dac7;border-radius:13px;padding:12px 16px;box-shadow:0 7px 30px #06192399;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;gap:10px}.selection-prompt p{margin:0;font-size:14px}
    .scene-layer{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:10;pointer-events:none;background:#06152435}.scene-content{text-align:center;max-width:85%;color:#f4fafb;animation:scene-in .25s ease-out}.scene-content h2{margin:12px 0 6px;font-size:25px;text-shadow:0 3px 10px #000}.scene-content p{background:#132d3cf0;padding:8px 14px;border-radius:8px;font-size:13px;max-width:400px;margin:6px auto}.scene-card{width:165px;height:230px;margin:auto;background:#173846;border:2px solid #80c7d3;border-radius:13px;box-shadow:0 18px 50px #0008;transform:rotate(-5deg)}.scene-card .table-art{height:100%;border-radius:12px}.scene-card img{width:100%;height:100%;object-fit:contain}
    .scene-turn{background:#123b4eec;border:1px solid #7cb9cc;border-radius:18px;padding:18px 35px}.scene-coin{font-size:60px;width:105px;height:105px;border-radius:50%;background:#e4c375;border:6px double #fff0b2;color:#513d1d;margin:auto;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 35px #0006}.scene-coin.toss{animation:coin-spin .65s linear infinite}.damage-float{position:absolute;top:35%;left:0;right:0;color:#ffbead;font-weight:bold;text-align:center;font-size:39px;text-shadow:0 3px 8px #000;animation:float-up .7s ease-out forwards;z-index:6}.damage-float.heal{color:#8cf0b3}
    .hit-card{animation:card-hit .4s ease-out}.glow-card{box-shadow:0 0 0 3px #b6e7bb,0 0 28px #80dcd477}.ko-card{animation:card-ko .65s ease-in forwards}.winner-box{padding:25px;text-align:center;background:#1f4051;border:1px solid #8dc3cc;border-radius:16px;margin-bottom:12px}.winner-box h2{margin-bottom:8px}.battle-log{max-height:200px;overflow:auto;white-space:pre-wrap;font-size:12px;line-height:1.8;background:#142233;padding:12px;border-radius:10px}.battle-log-wrap{margin-top:10px}.battle-log-wrap summary{cursor:pointer;color:#9bb8c7;font-size:12px;padding:8px}
    #battleChoice,#battleInspect{width:min(750px,94vw);max-height:90vh;overflow:auto;background:#192d3d;border:1px solid #6292a5;padding:22px;border-radius:18px}#battleChoice::backdrop,#battleInspect::backdrop{background:#05131dc4;backdrop-filter:blur(3px)}.choice-grid{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin:18px 0}.choice-card{width:130px;padding:10px;display:flex;flex-direction:column;gap:8px;text-align:center}.choice-card .table-art{height:154px}.choice-card img{height:100%;max-width:100%;object-fit:contain}.inspect-layout{display:grid;grid-template-columns:210px 1fr;gap:24px}.inspect-art{height:290px}.inspect-art img{max-width:100%;height:100%;object-fit:contain}.inspect-actions{display:flex;flex-direction:column;gap:9px}.skill-button{text-align:left;white-space:pre-line;line-height:1.6}.inspect-close{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.inspect-close h2{margin:0}.inspect-description{font-size:13px;line-height:1.8;color:#afc5d5}.soft-button{background:#213a49;border-color:#53768a}
    @keyframes scene-in{from{opacity:0;transform:translateY(15px) scale(.94)}to{opacity:1;transform:none}}@keyframes coin-spin{to{transform:rotateY(720deg)}}@keyframes card-hit{20%,60%{transform:translateX(-7px);filter:brightness(1.7)}40%,80%{transform:translateX(7px)}to{transform:none}}@keyframes card-ko{to{transform:translateY(15px) scale(.88);opacity:0}}@keyframes float-up{from{opacity:1;transform:translateY(12px)}to{opacity:0;transform:translateY(-40px)}}
    @media(max-width:650px){.battle-grid{grid-template-columns:1fr}#battlePage .header{align-items:flex-start;gap:6px}#battlePage .header h1{font-size:19px}.battle-top-actions{justify-content:flex-end}.battle-top-actions button{font-size:12px;padding:6px}.battle-table{padding:12px 42px;border-radius:17px;min-height:535px}.table-zone{min-height:250px;gap:10px}.bench-row{grid-template-columns:repeat(3,62px);gap:8px;min-height:92px}.table-card{width:62px;height:87px}.table-card.active{width:88px;height:123px}.active-row{min-height:131px}.zone-meta{font-size:10px}.magic-dot{width:10px;height:10px}.hp-badge{font-size:13px;padding:2px 4px;right:-5px;top:-6px}.hp-bar{width:26px}.energy-chip{width:15px;height:15px;font-size:9px}.energy-chips{bottom:16px;gap:1px}.ability-tag{font-size:7px}.card-name{font-size:8px;padding:3px 1px}.resource-rail{width:37px;gap:10px}.rail-human{right:3px;bottom:35px}.rail-foe{left:3px;top:48px}.pile{width:31px;height:44px;font-size:9px}.pile.discard{font-size:8px;min-height:30px}.zone-energy{width:32px;height:32px}.zone-energy .energy-chip{width:23px;height:23px;font-size:13px}.forecast{right:-5px;bottom:-5px}.forecast .energy-chip{width:16px;height:16px;font-size:9px}.resource-label{font-size:8px}.hand-tray{min-height:126px;gap:6px}.hand-card{width:70px;height:97px;flex-basis:70px}.scene-card{width:130px;height:182px}.scene-content h2{font-size:21px}.scene-content p{font-size:12px}.turn-strip{font-size:12px;padding:9px 10px}.inspect-layout{grid-template-columns:1fr}.inspect-art{height:200px}.inspect-art .table-art{width:145px;margin:auto}.choice-card{width:105px}.choice-card .table-art{height:130px}.selection-prompt{padding:10px;flex-wrap:wrap}.selection-prompt p{font-size:12px}}
    .battle-table{padding:18px 132px;min-height:710px}.table-zone{min-height:330px;gap:14px}.bench-row{grid-template-columns:repeat(3,110px);gap:18px;min-height:154px}.table-card{width:110px;height:154px}.table-card.active{width:148px;height:207px}.active-row{min-height:212px}.table-zone:first-of-type{padding-top:2px}.battle-table:before{top:50%}
    .resource-rail{width:108px;gap:15px;z-index:4}.rail-human{right:-118px;top:24px;bottom:auto}.rail-foe{left:-118px;top:24px}.resource-piles{display:flex;gap:10px;align-items:center}.pile,.pile.discard{position:relative;width:48px;height:68px;min-height:68px;padding:0;border:1px solid #79a6b7;border-radius:5px;background:#16303e;overflow:visible;box-shadow:3px 3px 0 #213b4c,5px 5px 0 #496474}.pile .table-art{border-radius:4px;height:100%;width:100%}.pile .table-art img{width:100%;height:100%;object-fit:contain}.pile-caption{position:absolute;top:100%;left:-5px;right:-5px;margin-top:7px;text-align:center;white-space:nowrap;font-size:11px;color:#d9e7ed}.resource-piles{margin-bottom:22px}.discard-empty{display:flex;align-items:center;justify-content:center;font-size:10px;height:100%;color:#7f9aaa}.pile.discard:has(.discard-empty){box-shadow:none;border-style:dashed}.pile.discard:hover{border-color:#d9b3ff;box-shadow:0 0 15px #b892d055}.card-back-art img{width:100%;height:100%;object-fit:contain}.magic-dots{display:flex;flex-wrap:wrap;justify-content:center;gap:3px;max-width:100%;font-size:11px}.magic-dots>span:first-child{flex-basis:100%;text-align:center;margin-bottom:4px;color:#d8c6ee}.magic-heart{width:27px;height:25px;display:inline-flex;color:#b57aee;filter:drop-shadow(0 0 5px #a569d877)}.magic-heart svg{width:100%;height:100%;fill:currentColor;stroke:#dcc0ff;stroke-width:1.4}.magic-heart.empty{padding:0;color:#30223f;filter:none}.magic-heart.empty svg{stroke:#705182}.magic-heart.lost{animation:heart-loss .7s ease-out both}@keyframes heart-loss{0%{color:#c386ff;transform:scale(1.25);filter:drop-shadow(0 0 9px #b578ff)}100%{color:#30223f;transform:scale(1);filter:none}}.hand-tray{justify-content:safe center;min-height:175px;gap:11px;padding:18px 12px 12px;align-items:flex-end}.hand-card{width:104px;height:146px;flex-basis:104px}.hand-backs{height:28px;margin:0 0 0;gap:4px}.mini-back{width:19px;height:27px;padding:0;overflow:hidden;border-radius:2px;border:0;background:none;flex-shrink:0}.mini-back .table-art{border-radius:2px}.shuffle-stack{animation:shuffle-rock .35s ease-in-out infinite;box-shadow:5px 5px 0 #496474,10px 10px 0 #243b50}@keyframes shuffle-rock{0%,100%{transform:rotate(-7deg) translateX(-8px)}50%{transform:rotate(7deg) translateX(8px)}}
    @media(max-width:650px){.battle-table{padding:12px 53px;min-height:535px}.table-zone{min-height:251px;gap:10px}.bench-row{grid-template-columns:repeat(3,70px);gap:7px;min-height:100px}.table-card{width:70px;height:98px}.table-card.active{width:105px;height:147px}.active-row{min-height:153px}.resource-rail{width:43px;gap:12px}.rail-human{right:-49px;top:6px;bottom:auto}.rail-foe{left:-49px;top:6px}.resource-piles{flex-direction:column;gap:24px;margin-bottom:18px}.pile,.pile.discard{width:35px;height:49px;min-height:49px}.pile-caption{font-size:9px;margin-top:5px}.magic-dots{gap:1px;font-size:9px}.magic-heart{width:13px;height:13px}.magic-dots>span:first-child{font-size:9px;margin-bottom:1px}.resource-label{font-size:8px}.hand-tray{min-height:141px;gap:7px;justify-content:safe center}.hand-card{width:82px;height:115px;flex-basis:82px}.hand-backs{height:19px;gap:2px}.mini-back{width:12px;height:17px}.discard-empty{font-size:8px}.energy-count{font-size:9px}}
    .resource-rail{position:absolute;inset:0;width:auto;gap:0;display:block;z-index:4;pointer-events:none}.resource-rail>*{pointer-events:auto}.resource-piles{display:contents}.resource-rail .pile{position:absolute}.rail-foe .deck-pile{left:-116px;top:235px}.rail-foe .discard{left:-116px;top:127px}.rail-human .deck-pile{right:-116px;top:24px}.rail-human .discard{right:-116px;top:137px}.resource-rail .zone-energy{position:absolute}.rail-foe .zone-energy{left:-115px;top:16px}.rail-human .zone-energy{right:-115px;bottom:28px}.resource-rail .resource-label{position:absolute;width:80px;text-align:center}.rail-foe .resource-label{left:-124px;top:90px}.rail-human .resource-label{right:-125px;bottom:5px}.foe-status{position:absolute;right:-95px;top:0;justify-content:flex-end;width:auto;z-index:4}.foe-status .magic-dots{flex-wrap:nowrap;gap:4px}.foe-status .magic-dots>span:first-child{flex-basis:auto;margin:0 6px 0 0;white-space:nowrap}.action-dock>.magic-dots{flex-wrap:nowrap;gap:4px;flex-shrink:0}.action-dock>.magic-dots>span:first-child{flex-basis:auto;white-space:nowrap;margin:0 6px 0 0}.action-dock .dock-help{font-size:12px}.battle-table{background:radial-gradient(ellipse at center,transparent,#09192466),linear-gradient(to bottom,#3c303f 0%,#3c303f 49.7%,#1c394e 50.3%,#1c394e 100%)}
    @media(max-width:650px){.resource-rail{inset:0;width:auto}.rail-foe .deck-pile{left:-47px;top:179px}.rail-foe .discard{left:-47px;top:104px}.rail-human .deck-pile{right:-47px;top:18px}.rail-human .discard{right:-47px;top:95px}.rail-foe .zone-energy{left:-47px;top:20px}.rail-human .zone-energy{right:-47px;bottom:29px}.rail-foe .resource-label{left:-51px;top:61px;width:45px}.rail-human .resource-label{right:-51px;bottom:10px;width:45px}.foe-status{top:-2px;right:-44px}.foe-status .magic-dots{gap:2px;font-size:9px}.foe-status .magic-dots>span:first-child{font-size:9px;margin-right:2px}.action-dock>.magic-dots .magic-heart{width:21px;height:20px}.action-dock>.magic-dots>span:first-child{font-size:11px}.action-dock>.magic-dots{order:1}.action-dock .dock-buttons{order:2;margin-left:auto}.action-dock .dock-help{order:3;flex-basis:100%}}
    .resource-rail .pile{width:84px;height:118px;min-height:118px}.rail-foe .discard{top:112px}.rail-foe .deck-pile{top:253px}.rail-human .deck-pile{top:12px}.rail-human .discard{top:152px}.deck-pile.deck-empty{border-style:dashed;box-shadow:none;background:#14273533}.discard-card{cursor:pointer;border:1px solid #638ea5;border-radius:10px;background:#203c50;color:#e0edf5}.discard-card:hover{border-color:#c99aee;box-shadow:0 0 14px #b87bdd33}.inspect-close{gap:8px;flex-wrap:wrap}
    @media(max-width:650px){.resource-rail .pile{width:46px;height:65px;min-height:65px}.rail-foe .discard{top:89px}.rail-foe .deck-pile{top:177px}.rail-human .deck-pile{top:14px}.rail-human .discard{top:103px}.rail-foe .zone-energy{top:8px}.rail-foe .resource-label{top:49px}.rail-human .zone-energy{bottom:19px}.rail-human .resource-label{bottom:1px}}
    #battleInspect.card-zoom-dialog{width:min(560px,96vw);padding:12px;max-height:96vh;background:#122635;border-radius:16px}.card-zoom-dialog .inspect-close{margin-bottom:8px}.card-zoom-dialog .inspect-close h2{font-size:18px}.zoom-frame{max-height:78vh;overflow:auto;padding:3px;scrollbar-width:thin}.zoom-card{position:relative;width:min(100%,calc(74vh * .713));aspect-ratio:806/1131;margin:auto;cursor:zoom-in}.zoom-card .table-art{height:100%;border-radius:2px}.zoom-card img{width:100%;height:100%;object-fit:contain;user-select:none;pointer-events:none}.zoom-frame.zoomed .zoom-card{width:800px;max-width:none;cursor:zoom-out;margin:0}.zoom-controls{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-top:10px}.zoom-controls button{font-size:12px;padding:7px 12px}.attack-dialog .zoom-card{cursor:default}.card-skill-overlay{position:absolute;left:6%;right:6%;display:flex;flex-direction:column;gap:8px;z-index:2}.on-card-skill{display:flex;align-items:center;gap:10px;min-height:62px;padding:8px 12px;border:2px solid #78b9c5;border-radius:10px;background:#112e3fe8;color:#eef8fb;box-shadow:0 3px 14px #05141d55;text-align:left}.on-card-skill:hover:not(:disabled){background:#285a65f2;border-color:#8df1c9;box-shadow:0 0 15px #78dcc766;transform:scale(1.02)}.on-card-skill:disabled{opacity:.65;cursor:not-allowed}.on-card-name{flex:1;font-size:19px}.on-card-skill .skill-cost{max-width:88px;flex-wrap:wrap}.on-card-skill .skill-damage{font-size:27px}.on-card-skill .energy-chip{width:20px;height:20px}
    @media(max-width:650px){#battleInspect.card-zoom-dialog{padding:10px}.zoom-frame{max-height:75vh}.zoom-card{width:min(100%,calc(70vh * .713))}.on-card-skill{min-height:51px;gap:6px;padding:6px 8px}.on-card-name{font-size:16px}.on-card-skill .skill-damage{font-size:24px}.on-card-skill .energy-chip{width:16px;height:16px}.on-card-skill .skill-cost{max-width:60px}.card-skill-overlay{gap:6px}}
    body:has(#battlePage:not([hidden])){overflow:hidden}#battlePage:not([hidden]){position:fixed;inset:6px;max-width:none;display:flex;flex-direction:column;gap:4px;overflow:hidden;margin:0}#battlePage .header{flex-shrink:0;margin:0;min-height:30px}#battlePage .header h1{font-size:18px;margin:0}#battlePage .turn-strip{flex-shrink:0;margin:0;padding:5px 10px;font-size:12px}#battlePage .action-dock{flex-shrink:0;min-height:32px;margin:0;padding:0}#battlePage .dock-help{font-size:11px}#battlePage .battle-log-wrap{flex-shrink:0;margin:0}#battlePage .battle-log-wrap summary{padding:3px}#battlePage .battle-log{max-height:120px}.mat-viewport{position:relative;flex:1;min-height:0;overflow:hidden;width:100%}.battle-mat{position:absolute;top:0;left:50%;width:1100px;transform-origin:top center}.human-status{position:absolute;left:-110px;top:18px;width:auto;z-index:4}.human-status .magic-dots{flex-wrap:nowrap}.human-status .magic-dots>span:first-child{flex-basis:auto;margin-right:6px}.selection-prompt{position:relative;top:0;flex-shrink:0;margin:0;padding:6px 10px}.selection-prompt p{font-size:12px}.winner-box{margin:0;padding:6px;flex-shrink:0}.winner-box h2{font-size:18px;margin:0}.winner-box p{margin:0;font-size:12px}
    @media(max-width:650px){.battle-mat{width:390px}.battle-table{padding-left:57px;padding-right:57px}.human-status{left:-49px;top:8px}.human-status .magic-dots{flex-wrap:wrap;max-width:46px}.human-status .magic-dots>span:first-child{flex-basis:100%;margin-right:0}.battle-top-actions{gap:4px}.battle-top-actions button{padding:4px;font-size:11px}#battlePage .header h1{font-size:15px}#battlePage .dock-help{display:none}.selection-prompt{gap:3px}.selection-prompt p{font-size:10px}.selection-prompt button{font-size:10px;padding:4px}.human-status .magic-heart{width:13px;height:13px}}
    .energy-chip{overflow:hidden;flex-shrink:0}.energy-chip img{width:100%;height:100%;object-fit:contain;border-radius:50%}.energy-chip .placeholder{font-size:8px;padding:0;line-height:1}.energy-count{position:absolute;bottom:37px;right:3px;background:#102b3eea;border:1px solid #6f9aaa;border-radius:4px;font-size:10px;padding:2px 4px;pointer-events:none}.energy-detail{background:#112534;border:1px solid #4e8496;border-radius:9px;padding:10px;font-size:13px;line-height:1.8}
    .attack-ready:hover{box-shadow:0 0 0 2px #93dfcf,0 0 25px #6adecb66;cursor:pointer}.attack-ready:hover:after{content:'选择技能';position:absolute;top:45%;left:0;right:0;text-align:center;background:#102a3eee;color:#fff;padding:6px;font-size:12px;pointer-events:none}
    .skill-button{display:flex;flex-direction:column;gap:7px;padding:14px 16px;border:1px solid #5c98a5;border-radius:13px;background:linear-gradient(135deg,#264e5e,#163442);color:#edf8fb;white-space:normal}.skill-button:hover:not(:disabled){border-color:#9ee6cf;box-shadow:0 0 15px #63d6b52b}.skill-button:disabled{opacity:.6}.skill-cost{display:flex;gap:4px}.skill-heading{display:flex;align-items:center;justify-content:space-between;font-size:18px;gap:12px}.skill-damage{font-size:29px;color:#edf8fb}.skill-damage.increased{color:#76eb9c}.skill-damage.decreased{color:#ff8c88}.skill-effect{font-size:12px;color:#c4dbe6}.skill-note{font-size:11px;color:#bdd2dd}
    .energy-drag-ghost img{width:100%;height:100%;object-fit:contain}.energy-drag-ghost{background:radial-gradient(circle at 30% 22%,#ffffffcc,transparent 40%),#bed9e8}.drag-ghost{position:fixed!important;z-index:99999;pointer-events:none!important;margin:0;transform:translate(-50%,-65%) rotate(-5deg)!important;opacity:.88;box-shadow:0 12px 30px #0009}.drop-legal{box-shadow:0 0 0 3px #62dcb8!important}.drop-hover{box-shadow:0 0 0 5px #ffe49a,0 0 25px #ffe49a99!important}.hand-card.playable,.rail-human .zone-energy:not(:disabled){cursor:grab}
    .coin-stage{width:150px;height:150px;margin:70px auto 20px;perspective:700px}.coin-body{position:relative;width:100%;height:100%;transform-style:preserve-3d}.coin-face{position:absolute;inset:0;backface-visibility:hidden;border-radius:50%}.coin-face.back{transform:rotateY(180deg)}.coin-face img{width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 7px 7px #0008)}.coin-fallback{display:flex;align-items:center;justify-content:center;background:#dec67b;color:#403317;font-size:60px;border:5px double #fff}.coin-fallback.back{background:#050505;color:#ddd}.coin-stage.tossing{will-change:transform}.coin-body.spinning{will-change:transform}@keyframes coin-arc{0%{transform:translateY(40px) scale(.8)}45%{transform:translateY(-65px) scale(1.15)}85%{transform:translateY(15px) scale(.95)}100%{transform:translateY(0) scale(1)}}@keyframes coin-flip{from{transform:rotateY(0) rotateZ(-12deg)}to{transform:rotateY(1440deg) rotateZ(0)}}
    .attribute-fx{position:absolute;inset:0;z-index:9;pointer-events:none;overflow:hidden}.attack-particle{position:absolute;width:58px;height:58px;filter:drop-shadow(0 0 10px currentColor);will-change:transform,opacity}.attack-particle svg{width:100%;height:100%;overflow:visible}.impact-ring{position:absolute;width:75px;height:75px;border:4px solid var(--fx-color);border-radius:50%;box-shadow:0 0 23px var(--fx-color),inset 0 0 20px var(--fx-color)}.fx-steel .impact-ring{border-radius:8px;transform:rotate(45deg)}.fx-bolt .impact-ring{border-style:dashed}.fx-dark .impact-ring{background:#120d24aa;border-width:8px}.fx-light .impact-ring{background:#fff6b344}.fx-droplet .impact-ring{border-style:double;border-width:9px}.fx-fist .impact-ring,.fx-normal .impact-ring{border-radius:20%;border-width:6px}.fx-dragon .impact-ring{border-color:#859bff;box-shadow:0 0 30px #ad8bff}.ko-flight{position:absolute;z-index:9;pointer-events:none;border:2px solid #c5a2ef;border-radius:8px;box-shadow:0 8px 25px #0008;transform-origin:center}.ko-flight-label{position:absolute;top:100%;left:-50%;width:200%;padding:4px;background:#192535e8;color:#e4d4fa;font-size:11px;text-align:center;border-radius:6px}
    @media(prefers-reduced-motion:reduce){.coin-stage,.coin-body{animation:none!important}}
    @media(prefers-reduced-motion:reduce){.scene-content,.scene-coin,.hit-card,.ko-card,.damage-float{animation:none!important}.hand-card{transition:none}}
  `;css.textContent+=`#battlePage .hand-card{width:124px;height:174px;flex-basis:124px}#battlePage .hand-tray{min-height:206px;padding-top:12px;padding-bottom:8px;gap:8px}#battlePage .magic-heart{filter:drop-shadow(0 1px 1px #183b3828)}#battlePage .magic-heart svg,.battle-result-layer .magic-heart svg{stroke:none}#battlePage .magic-heart.empty{opacity:.65;filter:none}#battlePage .magic-heart.empty svg .heart-outline{fill:none!important;stroke:#879a99;stroke-width:1.25}#battlePage .heart-base,.heart-piece{stroke:none;filter:drop-shadow(0 2px 3px #26354825)}#battlePage .heart-base.outline{filter:none}.heart-outline{fill:none!important}.heart-glint{fill:none!important}@media(max-width:650px){#battlePage .hand-card{width:92px;height:129px;flex-basis:92px}#battlePage .hand-tray{min-height:153px;padding-top:8px;padding-bottom:6px;gap:5px}}`;css.textContent+=`#battlePage .setup-concealed,#battlePage .setup-concealed:disabled{opacity:1!important}#battlePage .hand-card{width:138px;height:194px;flex-basis:138px}#battlePage .hand-tray{min-height:220px;padding-top:10px;padding-bottom:8px}.promotion-shade{position:absolute;inset:0;background:#081622bb;border-radius:inherit;z-index:5;pointer-events:none}.promotion-choice .table-zone[data-owner-zone="0"]{z-index:6}.promotion-choice .table-zone[data-owner-zone="0"]>:not(.bench-row){filter:brightness(.28)}.promotion-choice .bench-row .table-card:not(.targetable){filter:brightness(.28)}#battlePage .promotion-choice .bench-row .targetable{filter:none!important;outline:3px solid #baffec;outline-offset:4px;box-shadow:0 0 0 6px #55e5b84d,0 0 30px #73ffe3;animation:promotion-glow 1.2s ease-in-out infinite;z-index:7}#battlePage .promotion-muted{filter:brightness(.28)}@keyframes promotion-glow{50%{outline-color:#fff;box-shadow:0 0 0 8px #55e5b850,0 0 42px #a7ffef}}#battlePage .energy-current .energy-chip,#battlePage .energy-next .energy-chip{position:relative;border-radius:50%;overflow:hidden;background:radial-gradient(circle at 30% 22%,#ffffffcc 0,transparent 35%),radial-gradient(circle at 40% 35%,var(--energy-color) 20%,#132539 100%);box-shadow:inset -5px -7px 10px #061a4166,inset 3px 3px 6px #ffffffb0,0 5px 7px #0c2a3b45!important}#battlePage .energy-current .energy-chip:after,#battlePage .energy-next .energy-chip:after{content:'';position:absolute;inset:0;border-radius:50%;background:radial-gradient(ellipse at 27% 20%,#ffffffce 0,transparent 30%),radial-gradient(ellipse at 75% 85%,#010b3155 0,transparent 65%);box-shadow:inset 0 0 0 1px #ffffff70;pointer-events:none}#battlePage .deck-shuffling{animation:deck-shuffle .35s ease-in-out infinite}#battlePage .deck-shuffling:before,#battlePage .deck-shuffling:after{content:'';position:absolute;inset:0;border:1px solid #ecf8ff;border-radius:inherit;background:linear-gradient(135deg,#7291b9,#233c5f);z-index:-1;pointer-events:none}.deck-shuffling:before{animation:shuffle-left .5s ease-in-out infinite}.deck-shuffling:after{animation:shuffle-right .5s ease-in-out infinite}@keyframes deck-shuffle{25%{transform:rotate(-4deg)}75%{transform:rotate(4deg)}}@keyframes shuffle-left{50%{transform:translate(-12px,-3px) rotate(-7deg)}}@keyframes shuffle-right{50%{transform:translate(12px,-3px) rotate(7deg)}}@media(max-width:650px){#battlePage .hand-card{width:100px;height:140px;flex-basis:100px}#battlePage .hand-tray{min-height:162px;padding-top:8px;padding-bottom:6px}}@media(prefers-reduced-motion:reduce){#battlePage .targetable,#battlePage .deck-shuffling,#battlePage .deck-shuffling:before,#battlePage .deck-shuffling:after{animation:none!important}}`;css.textContent+=`#battlePage .promotion-choice .table-zone[data-owner-zone="0"]{z-index:8!important;filter:none!important}#battlePage .promotion-choice .bench-row{position:relative;z-index:9}#battlePage .promotion-choice .bench-row .targetable{opacity:1!important;filter:none!important}#battlePage .promotion-shade{background:#071724aa}#battlePage .energy-current:before{display:none!important}#battlePage .zone-energy,#battlePage .zone-energy:disabled{position:absolute;overflow:visible!important;height:82px!important}#battlePage .energy-current{align-items:flex-start;padding-top:0}#battlePage .energy-current>.energy-chip{position:relative;z-index:2;transform:translateY(-4px)}#battlePage .energy-pedestal{position:absolute;left:4px;right:4px;bottom:8px;height:21px;border-radius:50%;background:radial-gradient(ellipse at 50% 25%,#f5fcff 0,#a7c8d5 40%,#5c8496 65%,#35586d 100%);box-shadow:0 5px 0 #4d7285,0 8px 7px #13384e45;transform:perspective(120px) rotateX(12deg);border:1px solid #daeaf0;z-index:1}#battlePage .rail-human .zone-energy>.energy-next,#battlePage .rail-foe .zone-energy>.energy-next{left:auto!important;top:auto!important;right:-8px!important;bottom:0!important;width:28px;height:28px;z-index:3;display:flex;align-items:center;justify-content:center;background:#e9f4f9;border:1px solid #a7c4d3;border-radius:50%;box-shadow:0 2px 4px #24435733}#battleChoice.deck-search-dialog{width:min(1020px,95vw);max-height:92vh;padding:24px;background:linear-gradient(150deg,#edf4fc,#dfeaf4);border:1px solid #fff;border-radius:22px;box-shadow:0 20px 70px #17304b66}#battleChoice .search-header{display:flex;justify-content:space-between;gap:16px;align-items:center}#battleChoice .search-header h2{margin:0;font-size:24px}#battleChoice .search-subtitle{margin:7px 0 14px;font-size:13px;color:#596e80}#battleChoice .search-filter{width:100%;padding:10px 14px;margin-bottom:18px;background:#f8fcff;color:#23425c;border:1px solid #abc4d7;border-radius:10px}#battleChoice .search-body{display:grid;grid-template-columns:minmax(0,1fr) 230px;gap:22px}#battleChoice .search-card-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(125px,1fr));align-content:start;gap:16px;max-height:53vh;overflow:auto;padding:8px}#battleChoice .search-card{position:relative;display:flex;flex-direction:column;align-items:center;gap:7px;padding:7px;background:#f7fbff!important;border:2px solid transparent!important;border-radius:12px;box-shadow:0 4px 12px #24435714}#battleChoice .search-card>.table-art{width:100%;aspect-ratio:63/88;height:auto}#battleChoice .search-card img{width:100%;height:100%;object-fit:contain}#battleChoice .search-card strong{font-size:13px}#battleChoice .search-card.selected{border-color:#3ba6d2!important;background:#e6f7ff!important;box-shadow:0 0 0 3px #66bfe650}#battleChoice .search-count{position:absolute;right:2px;top:2px;background:#234663;color:white!important;padding:4px 7px;border-radius:8px;font-weight:700}#battleChoice .search-selection{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;background:#f6fbffb0;border:1px solid #c4d8e7;border-radius:14px;padding:14px}#battleChoice .search-large-art{width:100%;aspect-ratio:63/88}#battleChoice .search-large-art .table-art{height:100%}#battleChoice .search-large-art img{width:100%;height:100%;object-fit:contain}#battleChoice .search-meta{font-size:12px;color:#5c7487}#battleChoice .search-empty{font-size:14px;color:#647b8e;text-align:center}#battleChoice .search-footer{display:flex;align-items:center;justify-content:flex-end;gap:12px;margin-top:20px;padding-top:16px;border-top:1px solid #c0d2df}#battleChoice .search-summary{margin-right:auto;font-size:14px}#battleChoice .search-footer button:last-child{background:#317bab;color:white!important;min-width:125px}@media(max-width:650px){#battlePage .zone-energy,#battlePage .zone-energy:disabled{height:60px!important}#battlePage .energy-pedestal{left:0;right:0;height:15px;bottom:9px}#battlePage .rail-human .zone-energy>.energy-next,#battlePage .rail-foe .zone-energy>.energy-next{width:22px;height:22px;right:-8px!important;bottom:0!important}#battleChoice.deck-search-dialog{padding:15px}#battleChoice .search-body{grid-template-columns:minmax(0,1fr) 110px;gap:8px}#battleChoice .search-card-list{grid-template-columns:repeat(auto-fill,minmax(88px,1fr));gap:8px;max-height:50vh;padding:4px}#battleChoice .search-selection{padding:6px}#battleChoice .search-header h2{font-size:19px}#battleChoice .search-footer{gap:7px;flex-wrap:wrap}#battleChoice .search-summary{width:100%}}`;css.textContent+=`#battleChoice .search-sections{max-height:53vh;overflow:auto;padding:4px 8px}#battleChoice .search-group+.search-group{margin-top:22px;padding-top:18px;border-top:1px solid #b9cddd}#battleChoice .search-group-title{margin:0 0 10px;font-size:15px;color:#36566e}#battleChoice .eligible-group .search-group-title{color:#15745b}#battleChoice .search-sections .search-card-list{max-height:none;overflow:visible;padding:4px 0}#battleChoice .search-ineligible>.table-art{filter:none!important;opacity:1!important}#battlePage .effect-energy-count{position:absolute;top:0;right:0;border-radius:6px;background:#245d73;color:white;padding:2px 4px}@media(max-width:650px){#battleChoice .search-sections{max-height:50vh;padding:4px}}`;css.textContent+=`#battleInspect.card-zoom-dialog{background:transparent!important;border:0!important;box-shadow:none!important}#battleInspect.card-zoom-dialog .zoom-frame,#battleInspect.card-zoom-dialog .zoom-card{background:transparent!important;border:0!important;box-shadow:none!important}#battleInspect.raw-card-dialog{width:min(420px,88vw);max-height:92vh;padding:0;border:0;border-radius:0;background:transparent;box-shadow:none;overflow:visible}#battleInspect.raw-card-dialog::backdrop{background:#06131dcc}#battleInspect .raw-card-art{height:min(82vh,590px);background:transparent}#battleInspect .raw-card-art>.table-art{width:100%;height:100%;background:none}#battleInspect .raw-card-art img{width:100%;height:100%;object-fit:contain}#battlePage .hand-choice-muted{filter:brightness(.35);opacity:.65}#battlePage .hand-choice-eligible{filter:none;box-shadow:0 0 0 3px #9cf9cc,0 0 28px #5febadcc;animation:hand-choice-glow 1.3s ease-in-out infinite}#battlePage .hand-selection-prompt{display:flex;gap:12px;align-items:center}#battlePage .discard-entry{display:flex;flex-direction:column;gap:8px}@keyframes hand-choice-glow{50%{box-shadow:0 0 0 3px #baffdf,0 0 40px #5febad}}`;document.head.append(css);
  css.textContent+='\n    /* ROCOKINDOM visual system: pearl surfaces, aqua playmat, violet magic. */\n    body{background:radial-gradient(ellipse at 25% 0,#eef7ff 0,#e3ebf5 48%,#dce6f0 100%);color:#26384d}button,select,input{font:inherit}button{transition:background .18s,box-shadow .18s,transform .18s}\n    .menu-inner{max-width:850px}.menu h1{color:#263e62;font-size:clamp(32px,6vw,52px);letter-spacing:3px}.menu .muted{color:#667a92}.menu-options{gap:18px}.menu-button{position:relative;overflow:hidden;border:1px solid #fff;background:linear-gradient(140deg,#fff,#ecf3ff);color:#294766;border-radius:24px;box-shadow:0 12px 35px #6582a220;text-align:left;padding:30px}.menu-button strong{font-size:23px}.menu-button span{color:#75879b}.menu-button:hover{box-shadow:0 14px 35px #6582a240;border-color:#79cdd7}.menu-icon{display:flex;width:56px;height:56px;border-radius:17px;background:#dcecfb;color:#43699d;align-items:center;justify-content:center;margin-bottom:18px}.menu-icon svg{width:32px;height:32px}#openBattleTest{background:linear-gradient(140deg,#e6fcf5,#e9f2ff)}#openPlayerBattle{opacity:.55}\n    #battleSetup{color:#28405b}#battleSetup .panel{background:#f6faff;border:1px solid #c7d9e7;border-radius:20px}#battleSetup select,#battleSetup button{border-radius:12px}\n    #battlePage{color:#29485c}#battlePage .header h1{letter-spacing:2px}#battlePage .turn-strip{background:#f8fcff;border:1px solid #c8dde5;border-radius:20px;box-shadow:0 3px 10px #436e8e12}#battlePage button,#battlePage select{background:#f5faff;color:#315771;border:1px solid #c1d6e2;border-radius:13px}#battlePage button:hover:not(:disabled){background:#e0f6f4;border-color:#6bc7ba}#battlePage .battle-table{background:radial-gradient(ellipse at center,#e9fbfa,#c8e9e9 65%,#badfe3);border:2px solid #f9ffff;border-radius:30px;box-shadow:0 5px 24px #487b921c;overflow:hidden}#battlePage .table-zone{border-color:#92c5ce}#battlePage .table-card.empty{border:1px dashed #90bac8;background:#ffffff28;color:#769ba9;border-radius:10px}#battlePage .zone-meta{color:#426b7c}#battlePage .hand-tray{background:linear-gradient(#ffffff60,#ffffffa8);border-radius:0 0 24px 24px;border-top:1px solid #aed3dc}#battlePage .hand-card{box-shadow:0 4px 8px #31577122;border-radius:8px}#battlePage .hand-card.playable{border-color:#3eb49b;box-shadow:0 0 0 2px #63ddbf40,0 5px 10px #31577122}#battlePage .resource-label{color:#497185}#battlePage .selection-prompt{background:#f1fffb;color:#356c68;border:1px solid #77c8b5;border-radius:16px}#battlePage .battle-log-wrap{color:#5e7e92}#battlePage .battle-log{background:#f4faff;color:#476a7b}#battlePage .dock-help{color:#55788a}#battlePage .scene-turn{background:#f5ffffed;color:#284e65;border:1px solid #b4d9dd;box-shadow:0 4px 22px #356b8b20}#battlePage .scene-turn h2{color:#284e65}\n    #battleChoice,#battleInspect.card-zoom-dialog{background:#f4f8ff;color:#2c4962;border:1px solid #fff;border-radius:24px;box-shadow:0 25px 90px #18354c44}#battleChoice::backdrop,#battleInspect::backdrop{background:#23445d80;backdrop-filter:blur(8px)}#battleChoice button,#battleInspect button{color:#315771;border-color:#b9d5df;background:#faffff}#battleChoice .muted{color:#71869a}.choice-heading{display:flex;justify-content:space-between;align-items:center;gap:10px}.choice-heading h2{font-size:20px;margin:0}.choice-card{background:transparent!important;border:none!important;border-radius:14px;box-shadow:0 6px 15px #41667c15}.choice-card:hover{transform:translateY(-5px);box-shadow:0 9px 22px #41667c30}.choice-preview{height:70vh;cursor:pointer;margin:12px auto}.choice-preview .table-art{height:100%}.choice-preview img{height:100%;max-width:100%;object-fit:contain}.energy-choice{width:76px;height:76px;display:flex;align-items:center;justify-content:center;gap:2px;border-radius:50%!important}.energy-choice .energy-chip{width:46px;height:46px}.energy-choice small{font-size:12px;color:#47677b}\n    .card-skill-overlay{left:5%;right:5%;gap:9px}.on-card-skill{display:grid!important;grid-template-columns:max-content minmax(0,1fr) max-content;gap:8px;min-height:52px;padding:8px 10px;border:1px solid #98c7cc!important;border-radius:14px;background:linear-gradient(120deg,#f9fffff5,#e0f4f3f5)!important;box-shadow:0 4px 10px #21485b24;color:#294d61!important}.on-card-skill:hover:not(:disabled){background:#d5fff1!important;box-shadow:0 0 0 3px #5fddb55c;transform:translateY(-1px)}.on-card-skill:disabled{opacity:.72;filter:saturate(.45)}.on-card-skill .skill-cost{display:flex;flex-wrap:nowrap!important;max-width:none!important;gap:2px;white-space:nowrap}.on-card-skill .energy-chip{width:18px;height:18px;flex:0 0 18px}.on-card-name{font-size:17px;white-space:nowrap;min-width:0}.on-card-skill .skill-damage{font-size:25px;color:#29566a}.on-card-skill .skill-damage.increased{color:#149772}.on-card-skill .skill-damage.decreased{color:#b66666}\n    @media(max-width:650px){.menu-button{padding:22px}.menu-options{grid-template-columns:1fr 1fr;gap:12px}.menu-button strong{font-size:18px}.menu-button span{font-size:12px}.menu-icon{width:42px;height:42px;margin-bottom:12px}.on-card-skill{gap:5px;padding:7px;min-height:45px}.on-card-name{font-size:14px}.on-card-skill .energy-chip{width:15px;height:15px;flex-basis:15px}.on-card-skill .skill-damage{font-size:22px}.choice-heading h2{font-size:16px}.choice-heading button{font-size:12px;padding:8px}}\n';
  css.textContent+='\n:root{color-scheme:light;--bg:#e8f0f8;--panel:#f9fcff;--border:#c7d8e5;--text:#29475f;--muted:#73869b;--accent:#59b6bf}button,input,select{background:#f6fbff;color:#29475f}.primary,.add-button{background:#c8efe7;color:#255c59;border-color:#8bcac3}.danger{color:#b65768}.art{background:#e5edf5}#battleInspect{background:#f4f8ff;color:#2c4962}.battle-table{box-shadow:inset 0 0 50px #fff5!important}.choice-option{display:flex;flex-direction:column;align-items:center;gap:5px}.choice-option .preview-link{padding:5px 12px;font-size:12px;border:0;background:transparent!important;color:#528091!important}\n';
  css.textContent+='\n    #battlePage{color:#142331}#battlePage .zone-meta,#battlePage .resource-label,#battlePage .dock-help,#battlePage .battle-log-wrap,#battlePage .battle-log,#battlePage .table-card.empty{color:#263644}#battlePage .hp-badge{background:#fff;color:#121b24;border:2px solid #223643;box-shadow:0 2px 6px #0003;font-size:20px;line-height:1.15;padding:3px 7px;font-variant-numeric:tabular-nums;opacity:1}#battlePage .hp-bar{background:#c6d1d7;height:4px}#battlePage .hp-bar span{background:#177c49}#battlePage .card-name,#battlePage .energy-count,#battlePage .ability-tag{color:#fff;background:#172d3ee8;text-shadow:none}#battlePage .human-status{top:auto;bottom:0;left:-95px;right:auto}#battlePage .magic-dots{display:flex;flex-wrap:nowrap;gap:4px}#battlePage .human-status .magic-heart,#battlePage .foe-status .magic-heart{width:22px;height:21px}#battlePage .human-status .magic-dots{max-width:none}#battlePage .magic-heart.empty{opacity:.45}#battlePage .turn-strip,#battlePage .scene-turn,#battlePage .scene-turn h2{color:#142331}\n    .extra-energy-rack{display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;background:#fffef3;border:1px solid #d6c682;border-radius:16px;padding:8px;flex-shrink:0;color:#182d3c}.extra-help{font-size:12px}.extra-energy-token{display:flex;align-items:center;justify-content:center;flex-direction:column;gap:3px;width:58px;min-height:50px;padding:4px!important;border-radius:13px!important}.extra-energy-token .energy-chip{width:30px;height:30px}.extra-energy-token.assigned{background:#d5f5e9!important;border-color:#469b77!important}.extra-energy-token.picked{box-shadow:0 0 0 2px #d3a940}.extra-energy-token small{font-size:10px}.pending-energy{outline:2px dashed #b78020;outline-offset:1px}.drag-ghost.extra-energy-token{width:58px!important;height:58px!important}\n    @media(max-width:650px){#battlePage .hp-badge{font-size:17px;padding:2px 5px;border-width:1px}#battlePage .human-status{left:-44px;bottom:-2px;top:auto}#battlePage .human-status .magic-heart,#battlePage .foe-status .magic-heart{width:13px;height:13px}#battlePage .magic-dots,#battlePage .foe-status .magic-dots{gap:2px}.extra-energy-rack{padding:5px;gap:6px}.extra-energy-rack strong{font-size:12px}.extra-help{display:none}.extra-energy-token{width:44px;min-height:40px}.extra-energy-token .energy-chip{width:25px;height:25px}}\n';
  css.textContent+='#battlePage .magic-dots>span{flex:0 0 auto!important;margin:0!important}';
  css.textContent+="\n    /* Reference playmat and card HUD. Last rules intentionally override every earlier skin. */\n    #battlePage,#battlePage button,#battlePage select,#battlePage .turn-strip,#battlePage .selection-prompt,#battlePage .winner-box,#battlePage .dock-help,#battlePage .resource-label,#battlePage .pile-caption,#battlePage .discard-empty,#battlePage .forecast,#battlePage .battle-log-wrap,#battlePage .battle-log,#battlePage .zone-meta,#battlePage .extra-energy-rack,#battlePage .scene-content,#battlePage .scene-content h2,#battlePage .scene-content p{color:#17212c!important}#battleChoice,#battleChoice button,#battleChoice .muted,#battleInspect,#battleInspect button,#battleInspect .on-card-name,#battleInspect .skill-damage{color:#17212c!important}\n    #battlePage .battle-table{background:radial-gradient(circle at 50% 50%,#e8edf8 0 10%,transparent 10.4%),linear-gradient(to bottom,#efa694 0%,#df819b 49.5%,#c0d3ef 50%,#b9cef1 100%)!important;border:5px solid #e8edf9;border-radius:48% / 15%;box-shadow:inset 0 0 0 4px #aab6d0,inset 0 0 0 12px #ffffff80,0 8px 20px #44648622!important;padding:34px 100px 28px;min-height:790px;overflow:visible}\n    #battlePage .battle-table:before{left:8px;right:8px;top:50%;height:20px;transform:translateY(-50%);background:#e8edf8;z-index:0}#battlePage .battle-table:after{content:'';position:absolute;top:50%;left:50%;width:170px;height:170px;border:18px solid #e8edf8;border-radius:50%;transform:translate(-50%,-50%);background:#d1d9f4;pointer-events:none;z-index:0}#battlePage .table-zone{z-index:1;min-height:356px;gap:17px}#battlePage .bench-row{grid-template-columns:repeat(3,120px);gap:18px;min-height:168px}#battlePage .active-row{min-height:216px}#battlePage .table-card{width:120px;height:168px;background:transparent;border:0;border-radius:5px;box-shadow:0 3px 6px #22364c38}#battlePage .table-card.active{width:151px;height:212px}#battlePage .table-card .table-art,#battlePage .table-card img{border-radius:4px}#battlePage .table-card.empty{border:3px solid #ffffffa8!important;background:#ffffff0b!important;box-shadow:none;border-radius:8px;font-size:0!important}#battlePage .card-name,#battlePage .energy-count,#battlePage .ability-tag{display:none!important}\n    #battlePage .hp-badge{position:absolute;top:-14px;right:-5px;background:transparent!important;color:#263449!important;border:0!important;border-radius:0;box-shadow:none!important;padding:0!important;font:800 34px/1 Arial,sans-serif;letter-spacing:-1px;-webkit-text-stroke:4px #fff;paint-order:stroke fill;text-shadow:0 2px 3px #38566b55;min-width:53px;text-align:right;z-index:5}#battlePage .table-card.active .hp-badge{font-size:44px;top:-17px;min-width:68px}#battlePage .hp-bar{height:6px;width:100%;background:#c8d4d5;border-radius:4px;margin-top:1px;box-shadow:0 0 0 1px #fff}#battlePage .hp-bar span{background:#2ce29d!important;border-radius:4px}#battlePage .hp-badge.low .hp-bar span{background:#f0ab30!important}#battlePage .hp-badge.critical .hp-bar span{background:#e65a58!important}\n    #battlePage .energy-chips{bottom:-3px;left:0;right:auto;gap:0;flex-wrap:nowrap;filter:drop-shadow(0 1px 1px #152b5044)}#battlePage .energy-chips .energy-chip{width:23px;height:23px;margin-right:-2px;border:2px solid #dce9f6;box-shadow:none}#battlePage .target-muted{filter:brightness(.78)}#battlePage .hand-backs{height:38px;margin-top:-15px}.mini-back{width:29px;height:40px;box-shadow:0 2px 3px #0003}.mini-back:nth-child(3n+1){transform:rotate(-9deg)}.mini-back:nth-child(3n){transform:rotate(9deg)}#battlePage .hand-tray{background:linear-gradient(#bdcfee55,#edf4fb88);border:0;border-radius:0 0 40% 40%;padding-top:15px;gap:0;min-height:180px}#battlePage .hand-card{margin-left:-7px;border:2px solid #fff;box-shadow:0 3px 7px #22364c44}#battlePage .hand-card:nth-child(3n+1){transform:rotate(-5deg)}#battlePage .hand-card:nth-child(3n){transform:rotate(5deg)}#battlePage .hand-card:hover{transform:translateY(-12px) rotate(0deg);z-index:3}\n    #battlePage .zone-energy{background:radial-gradient(circle at 45% 40%,#e7f0ff 0 40%,#b9cdf1 43% 62%,#edf3ff 65%);border:0;box-shadow:0 0 0 3px #f3f7ff90,0 3px 7px #5774a533}#battlePage .zone-energy>.energy-chip{position:absolute;right:-2px;bottom:0;width:25px;height:25px}#battlePage .resource-label,#battlePage .pile-caption{font-weight:600;font-size:12px}#battlePage .foe-status{top:-18px}#battlePage .human-status{bottom:-18px}#battlePage .battle-top-actions button,#battlePage .dock-buttons button{background:#fff!important;border-color:#cad3df!important;color:#17212c!important}#battlePage .magic-heart{filter:drop-shadow(0 1px 1px #70539b55)}\n    @media(max-width:650px){#battlePage .battle-table{padding:26px 54px 22px;min-height:620px;border-width:3px;border-radius:48% / 12%;box-shadow:inset 0 0 0 2px #aab6d0,inset 0 0 0 8px #ffffff80!important}#battlePage .table-zone{min-height:276px;gap:15px}#battlePage .bench-row{grid-template-columns:repeat(3,78px);gap:10px;min-height:110px}#battlePage .active-row{min-height:156px}#battlePage .table-card{width:78px;height:110px}#battlePage .table-card.active{width:110px;height:154px}#battlePage .hp-badge{font-size:23px;top:-10px;min-width:37px;-webkit-text-stroke:3px #fff}#battlePage .table-card.active .hp-badge{font-size:31px;top:-13px;min-width:48px}#battlePage .hp-bar{height:4px}#battlePage .energy-chips .energy-chip{width:18px;height:18px}#battlePage .hand-backs{height:27px;margin-top:-10px}.mini-back{width:21px;height:30px}#battlePage .hand-tray{min-height:126px}#battlePage .battle-table:after{width:115px;height:115px;border-width:13px}#battlePage .battle-table:before{height:13px}#battlePage .resource-label,#battlePage .pile-caption{font-size:9px}#battlePage .foe-status{top:-15px}#battlePage .human-status{bottom:-15px}#battlePage .table-card.empty{border-width:2px!important}}\n";
  css.textContent+='\n    #battlePage .scene-content h2,#battlePage .scene-content p{color:#111827!important;background:#fffffff5!important;text-shadow:none!important;border:1px solid #d1d5db;border-radius:12px;padding:9px 16px;box-shadow:0 3px 12px #0002;line-height:1.4}#battlePage .scene-turn{background:#fffffff5!important;border-color:#d1d5db!important;color:#111827!important;box-shadow:0 3px 12px #0002}#battlePage .scene-turn h2,#battlePage .scene-turn p{background:transparent!important;border:0;box-shadow:none;padding:0;text-shadow:none!important}#battlePage .scene-content p{font-size:14px}#battlePage .magic-heart{color:#9555d4!important;background:none!important;filter:none!important;opacity:1!important}#battlePage .magic-heart svg{fill:#9555d4!important;stroke:none!important;filter:none!important}#battlePage .magic-heart.empty{color:#9ca3af!important}#battlePage .magic-heart.empty svg{fill:#9ca3af!important;stroke:none!important}#battlePage .magic-heart.lost{animation:heart-solid-loss .5s ease-out both!important}@keyframes heart-solid-loss{0%{transform:scale(1.2)}100%{transform:scale(1)}}\n';
  css.textContent+='\n    #battlePage .rail-foe .deck-pile,#battlePage .rail-foe .discard{left:-75px}#battlePage .rail-human .deck-pile,#battlePage .rail-human .discard{right:-75px}#battlePage .rail-foe .zone-energy{left:-72px}#battlePage .rail-human .zone-energy{right:-72px}#battlePage .rail-foe .resource-label{left:-83px}#battlePage .rail-human .resource-label{right:-83px}#battlePage .hp-badge{font-size:24px;min-width:43px;top:-10px;-webkit-text-stroke:3px #fff}#battlePage .table-card.active .hp-badge{font-size:30px;min-width:52px;top:-11px}#battlePage .hand-card,#battlePage .hand-card:nth-child(n),#battlePage .mini-back:nth-child(n){transform:none;margin-left:0}#battlePage .hand-tray{gap:8px}#battlePage .hand-card:hover{transform:translateY(-8px)}#battlePage .scene-layer{pointer-events:none}\n    @media(max-width:650px){#battlePage .rail-foe .deck-pile,#battlePage .rail-foe .discard{left:-32px}#battlePage .rail-human .deck-pile,#battlePage .rail-human .discard{right:-32px}#battlePage .rail-foe .zone-energy{left:-32px}#battlePage .rail-human .zone-energy{right:-32px}#battlePage .rail-foe .resource-label{left:-34px}#battlePage .rail-human .resource-label{right:-34px}#battlePage .hp-badge{font-size:18px;min-width:31px;top:-8px;-webkit-text-stroke:2px #fff}#battlePage .table-card.active .hp-badge{font-size:23px;min-width:39px;top:-9px}#battlePage .hand-tray{gap:5px}}\n';
  css.textContent+="\n    body:has(#battlePage:not([hidden])){background:radial-gradient(ellipse at 50% 0,#f6f4df,#e5eee4 60%,#d5e5df)}#battlePage .battle-table{background:radial-gradient(ellipse at 50% 50%,#f8f6e9aa,transparent 65%),linear-gradient(180deg,#e7ebe0 0 49.7%,#dcece2 50.3% 100%)!important;border:3px solid #879c8b;border-radius:24px;box-shadow:inset 0 0 0 5px #f5f2dc,inset 0 0 0 7px #bcc7ae,0 8px 24px #3b554322!important;overflow:hidden}#battlePage .battle-table:before{left:15px;right:15px;height:1px;background:#99aa90;top:50%;transform:none}#battlePage .battle-table:after{content:'✦';display:grid;place-items:center;width:74px;height:74px;background:#edf1e3;border:1px solid #b5c0a6;border-radius:14px;color:#adab77;font:48px/1 Georgia,serif;transform:translate(-50%,-50%);box-shadow:0 0 0 5px #f5f2dc88;z-index:0}#battlePage .table-card.empty{border:2px dashed #8da59380!important;background:#ffffff15!important}#battlePage .hand-tray{background:linear-gradient(#e9f0e380,#f7f7ec99);border-radius:0 0 18px 18px}#battlePage .foe-status{top:0;right:-75px}#battlePage .human-status{bottom:0;left:-75px}\n    #battlePage .zone-energy{width:78px;height:98px;display:flex;flex-direction:column;gap:5px;padding:6px;background:#fafbf4!important;border:2px solid #b7c6b2;box-shadow:0 3px 7px #526b4b20;border-radius:16px;opacity:1!important;color:#17212c!important}#battlePage .zone-energy:disabled{opacity:1!important;cursor:default}#battlePage .energy-zone-heading{font-size:11px;line-height:1.2;font-weight:500}#battlePage .energy-current{height:34px;display:flex;align-items:center;justify-content:center}#battlePage .energy-current .energy-chip{position:static;width:30px;height:30px;border:2px solid #fff;box-shadow:0 1px 4px #233a3022}#battlePage .energy-zone-status{font-size:12px;white-space:nowrap;line-height:1.25}#battlePage .energy-ready{background:#f3fff0!important;border-color:#549c5e;box-shadow:0 0 0 3px #89c78330}#battlePage .energy-used{background:#e7eae3!important;border-color:#94a08d}#battlePage .energy-check{color:#2b6743;font:700 32px/1 Arial}#battlePage .energy-empty,#battlePage .energy-setup,#battlePage .energy-waiting{background:#eef0e9!important;border-style:dashed}#battlePage .energy-none{font-size:27px;color:#667267}#battlePage .energy-next{display:flex;align-items:center;justify-content:center;gap:4px;width:84px;white-space:nowrap;font-weight:500}#battlePage .energy-next .energy-chip{width:17px;height:17px}#battlePage .rail-foe .zone-energy{left:-75px;top:12px}#battlePage .rail-human .zone-energy{right:-75px;bottom:30px}#battlePage .rail-foe .resource-label{left:-78px;top:116px}#battlePage .rail-human .resource-label{right:-78px;bottom:6px}\n    @media(max-width:650px){#battlePage .battle-table{border-radius:18px;border-width:2px;box-shadow:inset 0 0 0 3px #f5f2dc,inset 0 0 0 4px #bcc7ae!important}#battlePage .battle-table:after{width:50px;height:50px;border-width:1px;font-size:34px}#battlePage .battle-table:before{height:1px}#battlePage .foe-status{top:0;right:-32px}#battlePage .human-status{bottom:0;left:-32px}#battlePage .zone-energy{width:50px;height:72px;border-width:1px;border-radius:10px;padding:4px;gap:3px}#battlePage .energy-zone-heading{font-size:9px}#battlePage .energy-current{height:26px}#battlePage .energy-current .energy-chip{width:24px;height:24px}#battlePage .energy-zone-status{font-size:9px}#battlePage .energy-check{font-size:25px}#battlePage .energy-next{width:54px;font-size:8px;gap:2px}#battlePage .energy-next .energy-chip{width:13px;height:13px}#battlePage .rail-foe .zone-energy{left:-32px;top:0}#battlePage .rail-human .zone-energy{right:-32px;bottom:25px}#battlePage .rail-foe .resource-label{left:-34px;top:77px}#battlePage .rail-human .resource-label{right:-34px;bottom:7px}}\n";
  css.textContent+='\n    .draw-flight{position:fixed;left:0;top:0;z-index:90;pointer-events:none;perspective:900px;filter:drop-shadow(0 8px 12px #193d4c44);will-change:transform}.draw-flipper{position:relative;width:100%;height:100%;transform-style:preserve-3d}.draw-face{position:absolute;inset:0;backface-visibility:hidden;border-radius:5px;overflow:hidden;background:#fff}.draw-face .table-art{width:100%;height:100%;border-radius:5px}.draw-face img{width:100%;height:100%;object-fit:contain}.draw-front{transform:rotateY(180deg)}#battlePage .draw-destination{visibility:hidden;pointer-events:none}#battlePage .energy-chips.energy-stack{gap:0;max-width:100%}#battlePage .energy-chips.energy-stack .energy-chip{margin-right:calc(-1 * var(--energy-overlap));position:relative}#battlePage .energy-chips.energy-stack .energy-chip:last-child{margin-right:0}\n';
  css.textContent+='\n    #battlePage .extra-energy-rack,#battlePage .selection-prompt{position:absolute;right:10px;top:42%;transform:translateY(-50%);width:140px;z-index:25;display:flex;flex-direction:column;align-items:center;gap:8px;padding:10px;box-shadow:0 5px 18px #263d302b}#battlePage .selection-prompt p{font-size:12px}#battlePage .selection-prompt .dock-buttons{display:flex;flex-direction:column;gap:6px}#battlePage .extra-help{display:none}#battlePage .extra-energy-rack strong{font-size:12px;text-align:center}#battlePage .extra-energy-rack>button{max-width:100%}#battlePage .header{min-height:25px}#battlePage .dock-help{font-size:10px}#battlePage .action-dock{min-height:28px}.evolve-flight .table-art{height:100%;width:100%;border-radius:4px}\n    @media(max-width:650px){#battlePage .extra-energy-rack,#battlePage .selection-prompt{right:6px;width:88px;padding:6px;gap:5px}#battlePage .selection-prompt p{font-size:10px}#battlePage .selection-prompt button{font-size:10px;padding:5px}#battlePage .extra-energy-rack strong{font-size:10px}#battlePage .header{min-height:23px}#battlePage .hand-tray{min-height:115px;padding-top:10px;padding-bottom:6px}#battlePage .battle-top-actions button,#battlePage .battle-top-actions select{padding:3px 6px}}\n';
  css.textContent+='\n    #battlePage .turn-backdrop{position:absolute;inset:7px;border-radius:16px;pointer-events:none;z-index:0;background:radial-gradient(ellipse at 50% 50%,#f8f6e9aa,transparent 65%),linear-gradient(180deg,#e7ebe0 0 49.7%,#dcece2 50.3% 100%)}#battlePage .backdrop-player{background:radial-gradient(ellipse at 50% 78%,#c9e5cb99,transparent 65%),radial-gradient(ellipse at 50% 50%,#f8f6e9aa,transparent 65%),linear-gradient(180deg,#e7ebe0 0 49.7%,#dcece2 50.3% 100%)}#battlePage .backdrop-opponent{background:radial-gradient(ellipse at 50% 22%,#c9e5cb99,transparent 65%),radial-gradient(ellipse at 50% 50%,#f8f6e9aa,transparent 65%),linear-gradient(180deg,#e7ebe0 0 49.7%,#dcece2 50.3% 100%)}\n';
  css.textContent+='#battlePage .battle-table:before,#battlePage .battle-table:after{z-index:1}#battlePage .table-zone{z-index:2}';
  css.textContent+='\n    #battlePage .action-dock{position:absolute;right:6px;min-height:0!important;display:flex;padding:0!important;margin:0!important;z-index:9;width:auto}#battlePage .action-dock .dock-help{display:none}#battlePage .action-dock .dock-buttons{margin:0}#battlePage .action-dock button{padding:8px 15px;font-size:13px;border-radius:12px}#battlePage .hand-tray{padding-top:44px}#battlePage .scene-card{width:300px;height:420px;max-width:100%;border-radius:10px;transform:rotate(0deg);border:2px solid #fff;box-shadow:0 14px 38px #172b3a55}#battlePage .scene-card .table-art,#battlePage .scene-card img{border-radius:8px}#battlePage .scene-content h2{font-size:20px}\n    @media(max-width:650px){#battlePage .action-dock{right:5px}#battlePage .action-dock button{padding:6px 10px;font-size:12px}#battlePage .hand-tray{padding-top:38px}#battlePage .scene-card{width:220px;height:308px}#battlePage .scene-content h2{font-size:16px}}\n';
  css.textContent+='\n    .transfer-energy-flight{position:fixed;top:0;left:0;z-index:90;pointer-events:none;filter:drop-shadow(0 3px 5px #193d4c33)}.transfer-energy-flight .energy-chip{width:26px;height:26px}.energy-source-name{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#263544}#battlePage .extra-energy-rack{max-height:65%;overflow-y:auto}\n';
  css.textContent+='#battlePage .hand-tray{min-height:206px}@media(max-width:650px){#battlePage .hand-tray{min-height:145px}}';
  css.textContent+='\n    #battlePage .magic-player .magic-heart,#battlePage .magic-player .magic-heart svg{color:#32a55d!important;fill:#32a55d!important}#battlePage .magic-opponent .magic-heart,#battlePage .magic-opponent .magic-heart svg{color:#9555d4!important;fill:#9555d4!important}#battlePage .magic-dots .magic-heart.empty,#battlePage .magic-dots .magic-heart.empty svg{color:#9ca3af!important;fill:#9ca3af!important}#battlePage .magic-showcase{background:#fffffff5;border:1px solid #e0e5e1;border-radius:24px;padding:24px 42px;box-shadow:0 12px 45px #142e3244;min-width:260px}#battlePage .magic-showcase h2{background:transparent!important;border:0;box-shadow:none;margin:0;padding:0}#battlePage .broken-hearts{display:flex;justify-content:center;gap:15px;margin:15px 0 0;height:115px}.shatter-heart{width:105px;height:100px;position:relative}.heart-piece{position:absolute;inset:0;width:100%;height:100%;fill:#9555d4}.magic-player .heart-piece{fill:#32a55d}.piece-left{animation:heart-break-left 1.2s ease-out both}.piece-right{animation:heart-break-right 1.2s ease-out both}@keyframes heart-break-left{0%,15%{transform:translate(0,0) rotate(0);opacity:1}75%,100%{transform:translate(-30px,15px) rotate(-23deg);opacity:0}}@keyframes heart-break-right{0%,15%{transform:translate(0,0) rotate(0);opacity:1}75%,100%{transform:translate(30px,15px) rotate(23deg);opacity:0}}#battlePage .magic-remaining{display:block;font:800 42px/1.3 Arial,sans-serif;margin:5px 0 15px}#battlePage .magic-player .magic-remaining{color:#238746!important}#battlePage .magic-opponent .magic-remaining{color:#8244bf!important}#battlePage .magic-showcase .magic-heart{width:33px;height:31px}#battlePage .magic-showcase .magic-dots{justify-content:center}\n    #battlePage .backdrop-player{background:radial-gradient(ellipse at 50% 78%,#83bdf280,transparent 70%),linear-gradient(180deg,#e8edf0,#d9eafa)}#battlePage .backdrop-opponent{background:radial-gradient(ellipse at 50% 22%,#ed929280,transparent 70%),linear-gradient(180deg,#f4dfe0,#eee8e3)}#battlePage .turn-strip.strip-player{background:#e6f1ff;border-color:#73a8d7}#battlePage .turn-strip.strip-opponent{background:#ffeded;border-color:#d99a9a}#battlePage .scene-content.turn-banner{width:100%;max-width:100%;padding:17px 20px;border-radius:0;border:0;box-shadow:0 5px 22px #162a3833;animation:banner-enter .35s ease-out both}#battlePage .turn-banner.banner-player{background:linear-gradient(90deg,#296bbc,#4989ce)!important}#battlePage .turn-banner.banner-opponent{background:linear-gradient(90deg,#b93e48,#d56970)!important}#battlePage .turn-banner h2,#battlePage .turn-banner p{color:#fff!important;background:transparent!important;border:0;box-shadow:none;text-shadow:none;padding:0}#battlePage .turn-banner h2{font-size:28px;letter-spacing:4px}#battlePage .turn-banner p{font-size:14px;margin:3px 0}@keyframes banner-enter{from{opacity:0;transform:translateX(-35px)}to{opacity:1;transform:translateX(0)}}\n    @media(max-width:650px){#battlePage .magic-showcase{min-width:230px;padding:18px 20px}#battlePage .broken-hearts{height:90px}.shatter-heart{width:80px;height:78px}#battlePage .magic-remaining{font-size:35px}#battlePage .turn-banner h2{font-size:22px}#battlePage .turn-banner p{font-size:12px}}\n';
  css.textContent+='#battlePage .shatter-heart{width:130px;height:115px}#battlePage .broken-hearts{height:130px}@media(max-width:650px){#battlePage .magic-showcase{min-width:280px}#battlePage .shatter-heart{width:110px;height:100px}#battlePage .broken-hearts{height:115px}}';
  css.textContent+='\n    .battle-result-layer{position:fixed;inset:0;z-index:120;display:grid;place-items:center;overflow:auto;background:radial-gradient(ellipse at 50% 30%,#fffdf3,#e8f0fc 60%,#e2e5f4);color:#27384e;padding:20px}.result-panel{position:relative;width:min(560px,100%);text-align:center;display:flex;flex-direction:column;align-items:center;gap:12px;padding:20px}.result-title{font-size:clamp(42px,8vw,72px);letter-spacing:12px;margin:0;color:#b48629;text-shadow:0 2px 0 #fff;animation:result-title-enter .6s ease-out both}.result-defeat{background:radial-gradient(ellipse at 50% 30%,#edf1f8,#d7e0ec 70%,#c6d3e2)}.result-defeat .result-title{color:#556780}.result-draw .result-title{color:#536b68}.result-opponent{color:#526478;margin:0;font-size:14px}.result-team{display:flex;justify-content:center;align-items:center;gap:14px;min-height:300px;margin:15px 0}.result-team-card{width:145px;aspect-ratio:806/1131;animation:result-card-enter .6s ease-out both;animation-delay:calc(var(--card-order)*.12s);box-shadow:0 8px 22px #33445e30;border-radius:8px}.result-team-card:first-child{width:175px}.result-team-card .table-art,.result-mvp-card .table-art{height:100%;background:transparent}.result-team-card img,.result-mvp-card img{width:100%;height:100%;object-fit:contain}.result-sparks{position:absolute;inset:60px 0 80px;pointer-events:none;overflow:hidden}.result-sparks span{position:absolute;left:calc(var(--spark)*5.6%);top:30%;color:#d6b456;font-size:20px;animation:result-spark 2s ease-out infinite;animation-delay:calc(var(--spark)*-.13s)}.result-panel>button:not(.result-mvp-card){background:#fff;border:1px solid #b7c9da;color:#2c425b;border-radius:24px;min-width:150px;padding:12px 20px}.result-card-heading{font-size:15px;font-weight:500;color:#526478;margin:8px 0 0}.result-mvp-card{width:min(220px,40vh);aspect-ratio:806/1131;display:block;padding:0;border:0;border-radius:9px;box-shadow:0 10px 28px #24385222;background:transparent;animation:result-card-enter .5s ease-out both}.result-stats{width:min(350px,100%);display:grid;grid-template-columns:1fr 1fr;gap:0;margin:8px 0;background:#ffffffc9;border:1px solid #d6dfeb;border-radius:15px;padding:9px 16px;font-size:14px;text-align:left}.result-stats dt,.result-stats dd{margin:0;padding:7px 0;border-bottom:1px solid #e3e9f1}.result-stats dd{text-align:right;font-weight:600}.result-stats dt:last-of-type,.result-stats dd:last-of-type{border:0}.result-hearts{display:flex;align-items:center;gap:15px;margin:3px 0}.battle-result-layer .magic-heart{filter:none;color:#9555d4}.battle-result-layer .magic-heart svg{stroke:none;fill:#9555d4}.battle-result-layer .magic-player .magic-heart svg{fill:#32a55d}.battle-result-layer .magic-heart.empty svg{fill:#9ca3af}.battle-result-layer .magic-dots>span{flex:0 0 auto!important;margin:0!important}.battle-result-layer .magic-dots{flex-wrap:nowrap;gap:4px}\n    @keyframes result-title-enter{from{opacity:0;transform:scale(1.25)}to{opacity:1;transform:scale(1)}}@keyframes result-card-enter{from{opacity:0;transform:translateY(30px) scale(.9)}to{opacity:1;transform:translateY(0) scale(1)}}@keyframes result-spark{from{opacity:0;transform:translateY(0) scale(.5)}30%{opacity:1}to{opacity:0;transform:translateY(170px) scale(1.1)}}@media(max-width:650px){.battle-result-layer{padding:8px}.result-panel{padding:10px;gap:8px}.result-team{gap:7px;min-height:250px}.result-team-card{width:90px}.result-team-card:first-child{width:120px}.result-mvp-card{width:min(195px,33vh)}.result-stats{font-size:13px}.result-stats dt,.result-stats dd{padding:6px 0}}\n';
  css.textContent+='\n    #battlePage .drag-dimming .turn-backdrop{filter:brightness(.35)}#battlePage .drag-dimming:before,#battlePage .drag-dimming:after{filter:brightness(.35)}#battlePage .drag-dimming .table-card{filter:brightness(.3);transition:filter .16s,box-shadow .16s}#battlePage .drag-dimming .table-card.drop-legal{filter:none!important;box-shadow:0 0 0 3px #afffe0,0 0 22px #a1ffdba8!important;z-index:8}#battlePage .drag-dimming .table-card.empty.drop-legal{background:#e7fff2!important;border:2px solid #afffe0!important}#battlePage .drag-dimming .resource-rail,#battlePage .drag-dimming .zone-meta,#battlePage .drag-dimming .hand-backs{filter:brightness(.3)}.evolution-original,.evolution-new{transform-style:preserve-3d}.evolution-original .table-art,.evolution-new .table-art{width:100%;height:100%;border-radius:4px}.evolution-burst{position:fixed;width:320px;height:320px;border-radius:50%;z-index:95;pointer-events:none;background:radial-gradient(circle,#fff 0 18%,#fffef5ed 25%,#fffbd995 42%,#fff7cf00 70%);box-shadow:0 0 70px #fff9db80}\n';
  const menu=document.querySelector('.menu-options');
  const test=el('button',undefined,'menu-button');test.id='openBattleTest';
  test.append(el('strong','对战测试'),el('span','选择双方卡组，与对手对战'));menu.append(test);
  const pvp=el('button',undefined,'menu-button');pvp.id='openPlayerBattle';
    pvp.append(el('strong','玩家对战'),el('span','暂未开发'));menu.append(pvp);
  const menuPaths=['M8 5h15v22H8z M13 10h6 M13 15h6 M13 20h4','M5 8h15v19H5z M11 4h15v19 M9 13h7 M9 18h7','M6 5l20 22 M26 5L6 27 M4 22l6 6 M22 28l6-6','M11 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M22 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M3 27v-5c0-6 15-6 15 0v5 M20 18c7-1 10 3 9 9'];
  menu.querySelectorAll('.menu-button').forEach((b,i)=>{const icon=el('span',undefined,'menu-icon');icon.innerHTML='<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+menuPaths[i%4]+'"/></svg>';b.prepend(icon);});
  pvp.onclick=()=>alert('暂未开发');
  const selection=el('section');selection.id='battleSetupPage';selection.hidden=true;
  selection.innerHTML=`<div class="header"><h1>对战测试</h1><button id="battleSetupBack">返回主菜单</button></div>
    <div class="panel"><p class="muted">双方均可选择默认卡组或自己保存的卡组，也可以选择同一套。</p>
    <div class="battle-grid"><div><label for="humanDeck">自己的卡组</label><select id="humanDeck"></select><div id="humanPreview" class="battle-preview"></div></div>
    <div><label for="computerDeck">对手的卡组</label><select id="computerDeck"></select><div id="computerPreview" class="battle-preview"></div></div></div>
    <div class="battle-actions"><button id="beginBattle" class="primary">开始对战</button></div>
    <p class="muted">每方3点魔力；普通精灵被击倒扣1点，ex扣2点。初始5张手牌、备战最多3只、弱点加20。
    双方首回合不能进化，先手首回合不常规附能；其他效果附能后，满足需求仍可攻击。牌库抽空不直接判负；混合能量每回合随机产生一种。
    测试最多200个回合，超过则平局。</p></div>`;
  const arena=el('section');arena.id='battlePage';arena.hidden=true;
  document.querySelector('main').append(selection,arena);
  const dialog=el('dialog');dialog.id='battleChoice';document.body.append(dialog);
  dialog.addEventListener('cancel',e=>{e.preventDefault();if(targetChoice?.optional)finishChoice(null);});
  const inspector=el('dialog');inspector.id='battleInspect';document.body.append(inspector);
  const resultOverlay=el('section');resultOverlay.className='battle-result-layer';resultOverlay.hidden=true;document.body.append(resultOverlay);let resultSignature='';
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&targetChoice?.optional){e.preventDefault();finishChoice(null);}});
  const oldShowPage=showPage;
  showPage=function(page){selection.hidden=page!=='battleSetup';arena.hidden=page!=='battle';
    oldShowPage(page);if(page==='battleSetup')renderSetup();};
  test.onclick=()=>showPage('battleSetup');
  $('battleSetupBack').onclick=()=>showPage('menu');
  let available=[];
  function renderSetup(){available=allDecks();for(const prefix of ['human','computer']){
    const select=$(prefix+'Deck'),previous=select.value;select.replaceChildren();
    for(const [kind,label] of [[true,'默认卡组'],[false,'玩家卡组']]){
      const group=el('optgroup');group.label=label;
      available.forEach((d,i)=>{if(d.isDefault!==kind)return;const o=el('option',d.name+(kind?'（默认卡组）':''));
        o.value=String(i);o.disabled=!validDeck(d);group.append(o);});select.append(group);
    }
    if(previous&&available[Number(previous)])select.value=previous;
    else select.value=prefix==='computer'?'3':'0';
    select.onchange=()=>preview(prefix);preview(prefix);
  }}
  function preview(prefix){const d=available[Number($(prefix+'Deck').value)];
    $(prefix+'Preview').textContent=d?`${d.isDefault?'默认卡组':'玩家卡组'} · 能量：${d.energies.join('、')}\n`+
      d.cards.map(x=>`${card(x.id)?.name||'未知卡牌'} ×${x.count}`).join('、'):'';}
  function scoreMon(p,m){const c=info(m);return c.hp-m.damage+Math.max(...c.skills.map(s=>SKILLS[s][1]))+
    m.energy.length*25+(c.stage==='二阶'?40:0);}
  css.textContent+=`
#battlePage .action-dock{right:14px}#battlePage .action-dock button{min-width:98px;min-height:46px;border:2px solid #d7f6ff;border-radius:30px;background:linear-gradient(#4fa6e5,#246bbe)!important;color:#fff!important;font-weight:800;box-shadow:0 0 0 3px #65bdff55,0 0 18px #4cbdffe0,inset 0 1px 3px #ffffff88;text-shadow:0 1px 2px #163c65}#battlePage .action-dock button:disabled{background:#748da7;box-shadow:0 0 0 3px #b0d7ec33,0 0 12px #a5d9f066;opacity:.8}#battlePage .hand-tray{padding-top:16px}.ready-energy-flight{position:fixed;left:0;top:0;z-index:100;pointer-events:none}.ready-energy-flight .energy-chip{width:30px;height:30px;box-shadow:0 0 18px #8ce1ff}#battlePage .magic-showcase{background:transparent;border:0;box-shadow:none;padding:10px;min-width:0}#battlePage .broken-hearts{margin:0;gap:12px}.heart-base{position:absolute;inset:0;width:100%;height:100%;fill:currentColor;stroke:currentColor;stroke-width:1.3}.magic-player .shatter-heart{color:#32a55d}.magic-opponent .shatter-heart{color:#9555d4}.heart-base.outline{fill:transparent}#battlePage .magic-dots .magic-heart.empty svg{fill:transparent!important;stroke:currentColor;stroke-width:1.5}
#battleInspect.attack-dialog,#battleInspect.attack-dialog .zoom-frame{overflow:visible}#battleInspect.attack-dialog{background:transparent;box-shadow:none;border:0}#battleInspect.attack-dialog::backdrop{background:#10222c99;backdrop-filter:blur(5px)}.attack-dialog .inspect-close h2{display:none}.attack-dialog .inspect-close{justify-content:flex-end}.attack-dialog .zoom-card{transform:rotate(-3deg);filter:drop-shadow(0 12px 20px #0007)}.attack-dialog .card-skill-overlay{left:-7%;right:-7%;gap:10px;transform:rotate(3deg)}.attack-dialog .on-card-skill{background:linear-gradient(#ffad3d,#ec8824)!important;border:2px solid #baffff;box-shadow:0 0 0 2px #66dfff,0 0 16px #65eaffaa;color:#fff!important;min-height:65px;border-radius:13px;text-shadow:0 1px 2px #783809}.attack-dialog .on-card-skill strong{color:#fff!important}.attack-dialog .on-card-skill .skill-cost{max-width:none;flex-wrap:nowrap;flex-shrink:0;gap:2px}.attack-dialog .on-card-skill .energy-chip{width:22px;height:22px}.on-card-retreat{display:flex;justify-content:space-between;align-items:center;align-self:flex-end;width:66%;min-height:45px;padding:7px 16px;background:#f4fafcf2!important;color:#334953!important;border:2px solid #baffff;border-radius:11px;box-shadow:0 0 0 2px #66dfff,0 0 14px #65eaff88}.on-card-retreat .skill-cost{display:flex;flex-wrap:nowrap}.on-card-retreat:disabled{opacity:.65}.attack-dialog .zoom-controls{margin-top:15px}@media(max-width:650px){#battlePage .action-dock{right:9px}#battlePage .action-dock button{min-width:70px;min-height:34px;padding:5px 8px;font-size:10px}.attack-dialog .on-card-skill{min-height:48px;padding:6px;gap:5px}.attack-dialog .on-card-name{font-size:16px}.attack-dialog .on-card-skill .energy-chip{width:17px;height:17px}.attack-dialog .on-card-retreat{min-height:36px}}
`;
  css.textContent+=`
#battlePage .zone-energy,#battlePage .zone-energy:disabled{background:transparent!important;border:0!important;box-shadow:none!important;padding:0;width:78px;height:68px;animation:none!important}#battlePage .energy-current{width:100%;height:100%;position:relative}#battlePage .energy-current:before{content:'';position:absolute;inset:9px;border-radius:50%;background:radial-gradient(circle,#e9fbff88,transparent 72%);pointer-events:none}#battlePage .energy-current .energy-chip{width:54px;height:54px;border:0;box-shadow:0 2px 8px #30527133;animation:none!important}#battlePage .energy-next{width:78px;gap:0;height:26px}#battlePage .energy-next .energy-chip{width:23px;height:23px;border:0;box-shadow:0 2px 4px #30527133;animation:none!important}#battlePage .rail-human .zone-energy{bottom:34px}#battlePage .rail-human .energy-next{bottom:7px;right:-75px}#battlePage .rail-foe .zone-energy{top:12px}#battlePage .rail-foe .energy-next{top:81px;left:-75px}.attach-energy-flight{position:fixed;left:0;top:0;z-index:100;pointer-events:none}.attach-energy-flight .energy-chip{width:34px;height:34px;box-shadow:0 0 20px #a5efff}.forced-switch-flight{position:fixed;left:0;top:0;z-index:100;pointer-events:none;filter:drop-shadow(0 0 16px #9bdcff)}.forced-switch-flight .table-art{width:100%;height:100%}.forced-switch-flight img{width:100%;height:100%;object-fit:contain}.healing-fx{position:absolute;inset:0;pointer-events:none;overflow:visible;z-index:7}.heal-ring{position:absolute;inset:-8px;border:3px solid #a8ffd0;border-radius:14px;box-shadow:0 0 28px #5ee2a8,inset 0 0 20px #93ffc488;animation:healing-ring .8s ease-out both}.heal-particle{position:absolute;left:calc(8% + var(--i)*12%);top:75%;color:#c3ffdd!important;font:24px/1 sans-serif;text-shadow:0 0 8px #36d883;animation:healing-rise .7s ease-out both;animation-delay:calc(var(--i)*.025s)}@keyframes healing-ring{0%{opacity:0;transform:scale(.85)}25%{opacity:1}100%{opacity:0;transform:scale(1.12)}}@keyframes healing-rise{0%{opacity:0;transform:translateY(0) scale(.4)}25%{opacity:1}100%{opacity:0;transform:translateY(-110px) scale(1.1)}}@media(max-width:650px){#battlePage .zone-energy,#battlePage .zone-energy:disabled{width:50px;height:47px}#battlePage .energy-current .energy-chip{width:38px;height:38px}#battlePage .energy-next{width:50px;height:19px}#battlePage .energy-next .energy-chip{width:17px;height:17px}#battlePage .rail-human .energy-next{right:-32px;bottom:7px}#battlePage .rail-foe .energy-next{left:-32px;top:60px}}
`;
  css.textContent+=`
#battleInspect.attack-dialog .on-card-skill{background:linear-gradient(var(--skill-top),var(--skill-bottom))!important}#battleInspect.attack-dialog .on-card-skill strong{color:#fff!important}#battleInspect.attack-dialog .on-card-skill:disabled{opacity:1;filter:saturate(.55)}#battleInspect.attack-dialog .on-card-ability:disabled{opacity:1}.attack-dialog .on-card-retreat{margin-top:52px}.attack-dialog .card-skill-overlay{top:49%!important;gap:9px}.on-card-ability{display:flex;align-items:center;gap:9px;min-height:44px;padding:7px 12px;border:2px solid #edd2ff;border-radius:11px;background:#f1e5fa!important;color:#603978!important;box-shadow:0 0 13px #d6a2ee88;text-align:left}.on-card-ability strong{flex:1;color:#603978!important}.ability-marker{background:#81549d;color:white!important;border-radius:6px;padding:4px 7px;font-weight:700}.ability-mode{font-size:11px;color:#725b81!important}.on-card-ability:disabled{opacity:.75;cursor:default}#deckBackgrounds{margin:15px 0}#deckBackgrounds h3{font-size:15px;margin:8px 0}.deck-background-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.deck-background-option{display:flex;flex-direction:column;gap:6px;padding:7px;border:2px solid #c9d9e4;border-radius:10px;font-size:12px}.deck-background-option.selected{border-color:#388db9;box-shadow:0 0 0 2px #7bc7e955}.deck-background-preview{display:grid;place-items:center;width:100%;aspect-ratio:4/3;overflow:hidden;border-radius:6px;background:linear-gradient(135deg,#edf0df,#d2e6da);font-size:27px;color:#7b9c95}.deck-background-preview img{width:100%;height:100%;object-fit:cover}.deck-background-option:disabled{opacity:.5}.battle-background-image{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.68;pointer-events:none}.custom-background:after{content:'';position:absolute;inset:0;background:linear-gradient(#f4f8fc33,#eaf1eb44)}@media(max-width:650px){.attack-dialog .on-card-retreat{margin-top:30px}.on-card-ability{min-height:35px;padding:5px 7px;font-size:12px;gap:5px}.ability-marker{padding:3px 5px}.ability-mode{font-size:9px}}
`;
  css.textContent+=`
#deckBackgroundDialog{width:min(540px,94vw);padding:20px;border:1px solid #c3d4df;border-radius:18px;background:#f6fafc;color:#293e50}#deckBackgroundDialog::backdrop{background:#1c304a99;backdrop-filter:blur(4px)}#deckBackgroundDialog #deckBackgrounds{margin:0}#deckBackgroundDialog .deck-background-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.background-save-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:18px}#battlePage .custom-background .battle-background-image{opacity:1!important}#battlePage .custom-background:after{background:#edf4eb28}#battlePage .background-loaded:after{opacity:.35}
#battleInspect.attack-dialog{font-family:'Microsoft YaHei','PingFang SC','Noto Sans CJK SC',sans-serif}#battleInspect.attack-dialog .card-skill-overlay{left:-3%;right:-3%;gap:8px}#battleInspect.attack-dialog .on-card-skill{display:grid!important;grid-template-columns:124px minmax(0,1fr) 58px;align-items:center;gap:8px;min-height:68px;padding:10px 17px;border-radius:12px;text-shadow:none;text-align:left}#battleInspect.attack-dialog .on-card-skill .skill-cost{justify-content:flex-start;align-items:center;gap:3px;width:124px}#battleInspect.attack-dialog .on-card-skill .energy-chip{width:21px;height:21px;flex:0 0 21px}#battleInspect.attack-dialog .on-card-name{font-size:23px;font-weight:800;letter-spacing:.5px;text-align:center;white-space:nowrap}#battleInspect.attack-dialog .skill-damage{font-size:26px;font-weight:700;text-align:right}#battleInspect.attack-dialog .on-card-retreat{margin-top:3px;min-height:44px;width:66%;padding:7px 16px}#battleInspect.attack-dialog .on-card-ability{background:linear-gradient(var(--skill-top),var(--skill-bottom))!important;border-color:#baffff!important;box-shadow:0 0 0 2px #66dfff,0 0 16px #65eaffaa;filter:none!important}#battleInspect.attack-dialog .ability-marker{border:2px solid white;border-radius:6px;background:#d44249;color:white!important;font-size:16px;font-weight:800;padding:4px 11px}#battleInspect.attack-dialog .ability-mode{color:white!important;font-size:10px;text-align:right;white-space:normal}@media(max-width:650px){#battleInspect.attack-dialog .on-card-skill{grid-template-columns:92px minmax(0,1fr) 40px;gap:4px;min-height:52px;padding:7px 9px}#battleInspect.attack-dialog .on-card-skill .skill-cost{width:92px;gap:2px}#battleInspect.attack-dialog .on-card-skill .energy-chip{width:16px;height:16px;flex-basis:16px}#battleInspect.attack-dialog .on-card-name{font-size:18px;letter-spacing:0}#battleInspect.attack-dialog .skill-damage{font-size:22px}#battleInspect.attack-dialog .ability-marker{font-size:12px;padding:3px 8px}#battleInspect.attack-dialog .on-card-retreat{margin-top:2px}}
`;
  css.textContent+=`
.attack-windup-flight{position:fixed;z-index:100;pointer-events:none;transform-origin:center center;filter:drop-shadow(0 8px 18px #203a5566);transform-style:preserve-3d}.attack-windup-flight .table-art{width:100%;height:100%;border-radius:7px}.attack-windup-flight img{width:100%;height:100%;object-fit:contain}.retreat-flight{filter:drop-shadow(0 5px 13px #77bbdd66)}#battleInspect.attack-dialog .on-card-skill:disabled{background:linear-gradient(#a8adb3,#747d86)!important;filter:none!important;border-color:#b5bdc4!important;box-shadow:inset 0 1px 4px #29364255!important;opacity:.68;cursor:not-allowed}#battleInspect.attack-dialog .on-card-skill:disabled .energy-chip{filter:grayscale(1);opacity:.7}#battleInspect.attack-dialog .on-card-skill:disabled strong{color:#e5e8eb!important}#battleInspect.attack-dialog .on-card-skill:not(:disabled){cursor:pointer;transition:transform .16s,box-shadow .16s,filter .16s}#battleInspect.attack-dialog .on-card-skill:not(:disabled):hover,#battleInspect.attack-dialog .on-card-skill:not(:disabled):focus-visible{transform:translateY(-3px) scale(1.035)!important;filter:brightness(1.22);border-color:#fff!important;box-shadow:0 0 0 3px #9cffff,0 0 26px #5dffff,inset 0 0 13px #ffffff66!important;outline:0}#battleInspect.attack-dialog .on-card-skill:not(:disabled):active{transform:translateY(0) scale(.98)!important;filter:brightness(1.1)}#battleInspect.attack-dialog .on-card-retreat:not(:disabled):hover{transform:translateY(-2px);background:#e4ffff!important;box-shadow:0 0 0 3px #a8ffff,0 0 22px #7bdfff}#battleInspect.attack-dialog .on-card-ability:disabled .ability-marker{opacity:1;filter:none}
`;
  css.textContent+=`
.heavy-attack-flight{filter:drop-shadow(0 15px 20px #102e5588);backface-visibility:visible}.slam-impact-ring{position:fixed;width:90px;height:50px;border:5px solid #fff9d7;border-radius:50%;box-shadow:0 0 20px #fff,inset 0 0 18px #ffd978;background:#fff6bd77;z-index:101;pointer-events:none}.slam-impact-ray{position:fixed;width:35px;height:5px;border-radius:50%;background:#fff5c3;box-shadow:0 0 10px #fff;transform-origin:left center;z-index:101;pointer-events:none}
`;
  css.textContent+=`
.energy-discard-flight{position:fixed;left:0;top:0;z-index:105;pointer-events:none;filter:drop-shadow(0 0 7px #b8ecff)}.energy-discard-flight .energy-chip{width:100%;height:100%;border:1px solid #effaff;box-shadow:0 0 11px #8fd6ff}.energy-discard-flight .energy-chip img{width:100%;height:100%;object-fit:contain}
`;
  css.textContent+=`
#battlePage .energy-source-group{width:100%;padding:6px;border:1px solid #9ec5d5;border-radius:9px;background:#f4fbff;box-sizing:border-box}#battlePage .energy-source-heading{display:flex;align-items:center;gap:6px;font-size:11px;color:#263e51;font-weight:700}#battlePage .energy-source-thumb{width:31px;height:43px;padding:0;flex-shrink:0;border:0;border-radius:3px}#battlePage .energy-source-thumb .table-art{height:100%;width:100%}#battlePage .energy-source-pool{display:flex;flex-wrap:wrap;gap:4px;justify-content:center;margin-top:5px}#battlePage .energy-source-pool .extra-energy-token{width:36px;min-height:36px;padding:4px;display:flex;flex-direction:column;align-items:center}#battlePage .energy-source-pool .extra-energy-token small{font-size:8px}#battlePage .energy-donor-badge{position:absolute;left:0;top:-20px;background:#2f8dbb;color:#fff!important;border:1px solid #fff;border-radius:6px;padding:2px 6px;font-size:11px;z-index:8}#battlePage .table-card.energy-source-selected,#battlePage .table-card.energy-source-hover{box-shadow:0 0 0 3px #ffd66b,0 0 22px #ffc64caa!important;z-index:7}#battlePage .extra-energy-rack:has(.energy-source-group){max-height:62vh;overflow:auto}@media(max-width:650px){#battlePage .energy-source-heading{font-size:9px;gap:3px}#battlePage .energy-source-thumb{width:22px;height:31px}#battlePage .energy-source-group{padding:4px}#battlePage .energy-source-pool .extra-energy-token{width:27px;min-height:28px;padding:2px}#battlePage .energy-donor-badge{font-size:9px;top:-17px}}
`;
  css.textContent+=`
#deckBackgroundDialog{max-height:90vh;overflow:auto}#deckSleeves{margin-top:18px;border-top:1px solid #d5e2ea;padding-top:12px}#deckSleeves h3{font-size:15px;margin:0 0 9px}.deck-sleeve-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px}.deck-sleeve-option{display:flex;flex-direction:column;align-items:center;gap:6px;border:2px solid #c9d9e4;border-radius:10px;padding:6px;font-size:11px;background:#f8fbff}.deck-sleeve-option.selected{border-color:#388db9;box-shadow:0 0 0 2px #7bc7e955}.deck-sleeve-preview{display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;aspect-ratio:806/1131;overflow:hidden;border-radius:5px;background:#dce7ef;color:#7f98ac;font-size:22px}.deck-sleeve-preview small{font-size:9px}.deck-sleeve-preview img{width:100%;height:100%;object-fit:cover}.custom-card-sleeve{border:0!important;background:transparent!important;padding:0!important}.custom-card-sleeve img{width:100%;height:100%;object-fit:cover!important}@media(max-width:650px){.deck-sleeve-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.deck-sleeve-preview{max-width:70px}.deck-sleeve-option{font-size:11px}}
`;
  css.textContent+=`
#battlePage .resource-rail .pile{width:96px;height:135px;min-height:135px}#battlePage .rail-human .deck-pile,#battlePage .rail-human .discard{right:-75px}#battlePage .rail-foe .deck-pile,#battlePage .rail-foe .discard{left:-75px}#battlePage .rail-human .discard{top:158px}#battlePage .rail-foe .deck-pile{top:258px}#battlePage .pile .pile-quantity{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:#555b63b8;color:#fff!important;font:800 32px/1 Arial,sans-serif;border-radius:5px;opacity:0;transition:opacity .15s;pointer-events:none;z-index:6}#battlePage .pile:hover .pile-quantity,#battlePage .pile:focus-visible .pile-quantity{opacity:1}.used-card-discard-flight .table-art,.used-card-discard-flight img{width:100%;height:100%;border-radius:7px}
@media(max-width:650px){#battlePage .resource-rail .pile{width:54px;height:76px;min-height:76px}#battlePage .rail-human .discard{top:106px}#battlePage .rail-foe .deck-pile{top:179px}#battlePage .pile .pile-quantity{font-size:24px}}
`;
  css.textContent+=`
#battleInspect.attack-dialog .on-card-skill .skill-cost{gap:4px}#battleInspect.attack-dialog .on-card-skill .energy-chip{width:27px;height:27px;flex:0 0 27px}
#battlePage .damage-float:not(.heal){top:28%;left:-30%;right:-30%;color:#ffe566!important;font:900 66px/1 Impact,'Arial Black','Microsoft YaHei',sans-serif;letter-spacing:1px;-webkit-text-stroke:3px #543516;paint-order:stroke fill;text-shadow:0 3px 0 #fff8,0 6px 0 #422b19,0 9px 15px #20140988;transform-origin:50% 60%;animation:damage-impact-number .8s linear both;z-index:12;pointer-events:none}#battlePage .table-card.active .damage-float:not(.heal){font-size:78px}.damage-impact-flare{position:absolute;left:50%;top:43%;width:90px;height:90px;border-radius:50%;pointer-events:none;background:radial-gradient(circle,#fff9cba0,transparent 65%);animation:damage-number-flare .3s ease-out both;z-index:5}
@keyframes damage-impact-number{0%{opacity:0;transform:translateY(12px) scale(.45) rotate(-9deg)}10%{opacity:1;transform:translateY(-5px) scale(1.3) rotate(-4deg)}22%{opacity:1;transform:translateY(0) scale(.96) rotate(1deg)}32%,66%{opacity:1;transform:translateY(0) scale(1) rotate(0)}82%{opacity:1;transform:translateY(-12px) scale(1)}100%{opacity:0;transform:translateY(-32px) scale(.95)}}@keyframes damage-number-flare{from{opacity:1;transform:translate(-50%,-50%) scale(.3)}to{opacity:0;transform:translate(-50%,-50%) scale(1.65)}}
@media(max-width:650px){#battleInspect.attack-dialog .on-card-skill .energy-chip{width:25px;height:25px;flex-basis:25px}#battleInspect.attack-dialog .on-card-skill{grid-template-columns:114px minmax(0,1fr) 42px;gap:5px;padding:8px 10px}#battleInspect.attack-dialog .on-card-skill .skill-cost{width:114px;gap:3px}#battlePage .damage-float:not(.heal){font-size:48px;-webkit-text-stroke:2px #543516}#battlePage .table-card.active .damage-float:not(.heal){font-size:58px}}
@media(prefers-reduced-motion:reduce){.damage-impact-flare{animation:none;display:none}}
`;
  css.textContent+=`#battleInspect .discard-energy-images{display:flex;flex-wrap:wrap;gap:9px;align-items:center;padding:12px 0 18px}#battleInspect .discard-energy-images .energy-chip{width:38px;height:38px;border:0;box-shadow:0 2px 5px #243d5033}#battleInspect .discard-energy-images .energy-chip img{width:100%;height:100%;object-fit:contain}`;
  css.textContent+=`
.table-art:not(.custom-card-sleeve)>img{display:block;width:100%!important;height:100%!important;max-width:100%;max-height:100%;object-fit:contain!important;object-position:center!important}.evolution-original .table-art,.evolution-new .table-art,.ko-flight .table-art{width:100%;height:100%;padding:0;box-sizing:border-box;background:transparent}.ko-flight{border:0;background:transparent}.ko-flight-label{display:none}
#battleInspect.attack-dialog .on-card-retreat .energy-chip{width:27px;height:27px;flex:0 0 27px}#battleInspect.attack-dialog .on-card-retreat .skill-cost{gap:4px}
@media(max-width:650px){#battleInspect.attack-dialog .on-card-retreat .energy-chip{width:25px;height:25px;flex-basis:25px}#battleInspect.attack-dialog .on-card-retreat .skill-cost{gap:3px}}
`;
  css.textContent+=`
body:has(#battlePage:not([hidden])){background:#dbe7ed}#battlePage{isolation:isolate}#battlePage:before{content:'';position:fixed;inset:0;z-index:-2;pointer-events:none;background:radial-gradient(ellipse at 8% 80%,#72b5e94d,transparent 42%),radial-gradient(ellipse at 94% 12%,#dc899c40,transparent 43%),radial-gradient(ellipse at 50% 46%,#f6fafb 0,#e6edf0 48%,#c9d9e2 100%)}#battlePage:after{content:'';position:fixed;inset:0;z-index:-1;pointer-events:none;background-image:radial-gradient(circle at 17px 21px,#fff9 0 1.3px,transparent 1.8px),radial-gradient(circle at 89px 73px,#6599bc38 0 1px,transparent 1.8px),linear-gradient(125deg,transparent 47%,#ffffff20 49%,transparent 51%);background-size:137px 163px,211px 197px,100% 100%}
.battle-ambient{position:fixed;inset:0;z-index:-1;pointer-events:none;overflow:hidden}.ambient-seal{position:absolute;width:440px;height:440px;border:1px solid #608cac2e;border-radius:50%;box-shadow:0 0 0 19px #ffffff12,0 0 0 20px #7d9eb525,0 0 0 56px #ffffff08,0 0 0 57px #7d9eb51c;opacity:.75}.ambient-seal:before{content:'';position:absolute;inset:45px;border:1px dashed #739ab13b;border-radius:50%}.ambient-seal:after{content:'✧';position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:330px/1 Georgia,serif;color:#799fb321;transform:rotate(15deg)}.ambient-seal-left{left:-190px;bottom:-80px;transform:rotate(-18deg)}.ambient-seal-right{right:-180px;top:-100px;transform:rotate(22deg);border-color:#b2879e30}.ambient-spark{position:absolute;width:4px;height:4px;background:#fff;border-radius:50%;box-shadow:0 0 9px #8cd8ff;opacity:.6;animation:ambient-float 9s ease-in-out infinite;left:var(--x);top:var(--y);animation-delay:var(--delay)}@keyframes ambient-float{0%,100%{transform:translateY(0);opacity:.25}50%{transform:translateY(-15px);opacity:.7}}#battlePage .header,#battlePage .turn-strip,#battlePage .battle-log-wrap{background:#f5f9fbbf;border-color:#b5cbd955;backdrop-filter:blur(6px)}#battlePage .header{border-radius:14px;padding:8px 12px}#battlePage .battle-log-wrap{border-radius:10px;padding:6px 10px}
@media(max-width:650px){.ambient-seal{width:280px;height:280px}.ambient-seal-left{left:-185px}.ambient-seal-right{right:-175px}.ambient-seal:after{font-size:210px}}
@media(prefers-reduced-motion:reduce){.ambient-spark{animation:none}}
`;
  css.textContent+=`#battlePage .selection-prompt,#battlePage .extra-energy-rack{background:transparent!important;border:0!important;box-shadow:none!important}#battlePage .selection-prompt{padding:0}#battlePage .dock-help{display:none!important}`;
  css.textContent+=`#battlePage .special-status-icons{position:absolute;left:-13px;top:20px;display:flex;flex-direction:column;gap:5px;z-index:8;pointer-events:none}.special-status-icon{display:flex;justify-content:center;align-items:center;width:28px;height:28px;border-radius:50%;background:var(--status-color);color:#fff!important;border:2px solid #fff;box-shadow:0 2px 6px #18314055;font:900 17px/1 Arial,sans-serif}.status-recovered{animation:status-recovery .45s ease-out}@keyframes status-recovery{from{filter:brightness(1.8);box-shadow:0 0 22px #a6f7cf}to{filter:brightness(1);box-shadow:none}}@media(max-width:650px){.special-status-icon{width:22px;height:22px;font-size:13px}#battlePage .special-status-icons{left:-10px}}`;
  css.textContent+=`.status-check-pulse{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;color:var(--status-color)!important;text-shadow:0 0 12px #fff;font:900 60px/1 Arial,sans-serif;animation:status-check-pulse .8s ease-out both;z-index:7}.status-checking .special-status-icons{filter:drop-shadow(0 0 6px var(--status-color))}@keyframes status-check-pulse{0%{opacity:0;transform:scale(.5)}25%{opacity:.7;transform:scale(1)}100%{opacity:0;transform:scale(1.4)}}@media(prefers-reduced-motion:reduce){.status-check-pulse{animation:none;display:none}}`;
  css.textContent+=`@property --battle-wipe{syntax:'<percentage>';inherits:false;initial-value:-15%}.diagonal-background-wipe{mask-image:linear-gradient(135deg,#000 calc(var(--battle-wipe) - 12%),transparent calc(var(--battle-wipe) + 12%));-webkit-mask-image:linear-gradient(135deg,#000 calc(var(--battle-wipe) - 12%),transparent calc(var(--battle-wipe) + 12%))}.previous-turn-backdrop{pointer-events:none}.opponent-play-flight{position:fixed;left:0;top:0;z-index:100;pointer-events:none;filter:drop-shadow(0 12px 20px #19384d66)}.opponent-play-flight .table-art{width:100%;height:100%;border-radius:8px}`;
  css.textContent+=`
#battleChoice .search-card.search-eligible{border-color:#35a989!important;background:#ecfff6!important;box-shadow:0 0 0 1px #35a98930,0 4px 12px #24435714}#battleChoice .search-card.search-eligible:hover{border-color:#148261!important;box-shadow:0 0 0 3px #35a98940}#battleChoice .search-card.search-ineligible{border-color:#b9c4ce!important;background:#f7fbff!important;box-shadow:none}#battleChoice .search-ineligible>.table-art{filter:none;opacity:1}#battleChoice .search-ineligible>strong,#battleChoice .search-ineligible>.search-meta{color:#23425c}#battleChoice .search-eligibility{align-self:stretch;text-align:center;padding:5px 7px;border-radius:7px;background:#248c6b;color:#fff!important;font-size:12px;font-weight:700}#battleChoice .search-ineligible .search-eligibility{background:#76838f}#battleChoice .search-card.search-eligible.selected{border-color:#268cc7!important;background:#e6f7ff!important;box-shadow:0 0 0 3px #66bfe650}#battleChoice .search-eligible.selected .search-eligibility{background:#268cc7}
`;
  css.textContent+=`#battlePage .attached-tool-badge{position:absolute;right:-8px;bottom:24px;padding:4px 7px;background:#7956a2;color:white!important;border:1px solid #fff;border-radius:7px;font-size:11px;z-index:8;pointer-events:none}`;
  async function choose(owner,title,options,optional=false){
    if(!options.length&&title!=='选择加入手牌的精灵（向对方展示）')return null;
    if(options.length===1&&options.every(o=>o.kind==='mon'||o.kind==='slot'))return options[0].value;
    if(networkHooks?.role==='server')return networkHooks.choose(owner,title,options,optional);
    if(queuedHandDrop&&title==='魔力果：选择对应基础精灵'){const uid=queuedHandDrop;queuedHandDrop=null;if(options.some(o=>o.value===uid))return uid;}
    if(owner===1){const best=options.slice().sort((a,b)=>(b.score||0)-(a.score||0))[0];
      return optional&&(best.score||0)<=0?null:best.value;}
    return new Promise(resolve=>{chooser=resolve;selectedTarget=null;
      targetChoice={title,options,optional};dialog.className='';
      if(options.every(o=>o.kind==='handCard')){targetChoice.handAction=title.startsWith('魔力果')?'candy':'box';render();return;}
      if(title==='选择加入手牌的精灵（向对方展示）'){paintDeckSearch(options,optional);dialog.showModal();return;}
      if(options.every(o=>o.kind==='mon'||o.kind==='slot')){render();return;}
      const paint=(hand=false)=>{
        dialog.replaceChildren();const head=el('div',undefined,'choice-heading');dialog.setAttribute('aria-label',hand?'当前手牌':title);
        if(!options.every(o=>o.kind==='energy'))head.append(actionButton(hand?'返回精灵选择':'查看手牌 · '+game.players[0].hand.length,()=>paint(!hand)));
        dialog.append(head);
        const grid=el('div',undefined,'choice-grid');
        if(hand){for(const id of game.players[0].hand){const c=card(id),b=actionButton('',()=>{
          dialog.replaceChildren(actionButton('返回手牌',()=>paint(true)));const large=el('div',undefined,'choice-preview');large.append(artwork(c,'choice-preview'));large.onclick=()=>paint(true);dialog.append(large);
        });b.className='choice-card';b.append(artwork(c,'hand-preview-'+id),el('span',c.name));grid.append(b);}}
        else for(const o of options){const c=o.cardId?card(o.cardId):cards.find(c=>c.name===o.label),b=actionButton(o.label,()=>finishChoice(o.value));
          if(o.kind==='energy'){b.className='energy-choice';b.replaceChildren(energyChip(o.energy));b.setAttribute('aria-label',o.label);b.title=o.label;if(o.doubled)b.append(el('small','×2'));}
          else if(c){b.className='choice-card';b.replaceChildren(artwork(c,'choice-'+o.value+'-'+c.id),el('span',c.name));}
          if(c&&o.kind!=='energy'){const wrap=el('div',undefined,'choice-option');const link=actionButton('放大卡图',()=>{dialog.replaceChildren(actionButton('返回精灵选择',()=>paint(false)));const large=el('div',undefined,'choice-preview');large.append(artwork(c,'candidate-preview'));large.onclick=()=>paint(false);dialog.append(large);});link.className='preview-link';wrap.append(b,link);grid.append(wrap);}else grid.append(b);}
        dialog.append(grid);if(optional&&!hand)dialog.append(actionButton(title.includes('初始备战')?'准备完成':'跳过 / 返回',()=>finishChoice(null)));
      };paint();
      dialog.showModal();});
  }
  function paintDeckSearch(options,optional){
    const groups=new Map(),eligible=new Map();
    for(const o of options){if(o.value===null)continue;const c=o.cardId?card(o.cardId):cards.find(c=>c.name===o.label);if(c)eligible.set(c.id,o);}
    for(const id of (networkSearchCards||game.players[0].deck)){const c=card(id);if(!c)continue;if(!groups.has(c.id))groups.set(c.id,{c,o:eligible.get(c.id),count:0});groups.get(c.id).count++;}
    // Older servers may conceal deck identities; retain every supplied candidate.
    for(const [id,o] of eligible)if(!groups.has(id)){const c=card(id);if(c)groups.set(id,{c,o,count:options.filter(x=>x.label===c.name).length});}
    const hasTargets=eligible.size>0;let handMode=false,viewed=null;
    dialog.className='deck-search-dialog';dialog.setAttribute('aria-label','检索牌库');dialog.replaceChildren();
    const header=el('div',undefined,'search-header'),title=el('div');
    title.append(el('h2','检索牌库'),el('p',hasTargets?'查看剩余牌库，选择1只符合条件的精灵加入手牌。':'牌库没有符合条件的精灵，查看后点击完成检索。','search-subtitle'));header.append(title);
    const toggle=actionButton('查看手牌',()=>{handMode=!handMode;toggle.textContent=handMode?'返回牌库':'查看手牌';input.value='';paintList();});header.append(toggle);dialog.append(header);
    const input=el('input');input.type='search';input.placeholder='搜索卡名或属性';input.setAttribute('aria-label','搜索牌库卡牌');input.className='search-filter';dialog.append(input);
    const body=el('div',undefined,'search-body'),list=el('div',undefined,'search-sections'),preview=el('div',undefined,'search-selection');body.append(list,preview);dialog.append(body);
    const footer=el('div',undefined,'search-footer'),summary=el('span',undefined,'search-summary');
    const confirmButton=actionButton(hasTargets?'加入手牌':'完成检索',()=>finishChoice(hasTargets?selectedTarget:null),hasTargets);footer.append(summary);
    if(optional&&hasTargets)footer.append(actionButton('不选择，完成检索',()=>finishChoice(null)));footer.append(confirmButton);dialog.append(footer);
    const selection=()=>{preview.replaceChildren();const picked=[...groups.values()].find(g=>g.o&&g.o.value===selectedTarget);confirmButton.disabled=hasTargets&&!picked;summary.textContent=picked?'已选择：'+picked.c.name:hasTargets?'尚未选择':'没有符合条件的精灵';
      if(!viewed){preview.append(el('p','点击卡牌放大查看；符合条件的精灵可以选择。','search-empty'));return;}
      const image=el('div',undefined,'search-large-art');image.append(artwork(viewed,'search-selected-'+viewed.id));preview.append(image,el('strong',viewed.name),el('span',viewed.category==='精灵'?viewed.stage+' · '+viewed.attribute+' · HP '+viewed.hp:viewed.category,'search-meta'));
      if(eligible.has(viewed.id)&&!handMode)preview.append(el('span','可加入手牌','search-meta'));else preview.append(el('span','仅供查看','search-meta'));};
    const paintList=()=>{list.replaceChildren();const query=input.value.trim(),items=(handMode?game.players[0].hand.map(id=>({c:card(id),count:1})):[...groups.values()]).filter(g=>g.c&&(!query||[g.c.name,g.c.attribute,g.c.stage].some(v=>String(v||'').includes(query))));
      const sections=handMode?[{title:'手牌',items}]:[{title:'可选择 · '+items.filter(g=>g.o).length+'种',items:items.filter(g=>g.o),eligible:true},{title:'不可选择 · '+items.filter(g=>!g.o).length+'种',items:items.filter(g=>!g.o),eligible:false}];
      for(const section of sections){const group=el('section',undefined,'search-group'+(section.eligible?' eligible-group':'')),heading=el('h3',section.title,'search-group-title'),grid=el('div',undefined,'search-card-list');group.append(heading,grid);list.append(group);
        for(const g of section.items){const selectable=!handMode&&!!g.o;
          const tile=actionButton('',()=>{viewed=g.c;if(selectable)selectedTarget=g.o.value;paintList();selection();});tile.className='search-card '+(handMode?'search-view-only':selectable?'search-eligible':'search-ineligible')+(selectable&&g.o.value===selectedTarget?' selected':'');tile.setAttribute('aria-pressed',String(selectable&&g.o.value===selectedTarget));tile.setAttribute('aria-label',g.c.name+(selectable?'，点击选择':'，点击查看'));
          tile.append(artwork(g.c,'search-option-'+g.c.id),el('strong',g.c.name),el('span',(g.c.category==='精灵'?g.c.stage:g.c.category),'search-meta'));if(g.count>1)tile.append(el('span','×'+g.count,'search-count'));grid.append(tile);}
        if(!section.items.length)grid.append(el('p',query?'没有匹配的卡牌':handMode?'手牌为空':section.eligible?'没有符合条件的精灵':'没有其他卡牌','search-empty'));
      }};
    input.oninput=paintList;paintList();selection();
  }
  function finishChoice(value){if(networkHooks?.role==='client'&&targetChoice?.setup){networkHooks.send('setupDone',{});return;}if(dialog.open)dialog.close();dialog.className='';networkSearchCards=null;const f=chooser;chooser=null;targetChoice=null;selectedTarget=null;render();if(f)f(value);}
  const monOptions=(p,list)=>list.map(m=>({value:m.uid,kind:'mon',cardId:m.id,
    label:`${info(m).name}（HP ${info(m).hp-m.damage}，能量${m.energy.length}）`,score:scoreMon(p,m)}));
  const byUid=(p,uid)=>mons(p).find(m=>m.uid===uid);
  async function chooseMon(owner,title,list,optional=false){const p=game.players[owner];
    return byUid(p,await choose(owner,title,monOptions(p,list),optional));}
  function swap(p,m){const i=p.bench.indexOf(m);if(i<0)return;
    const old=p.active;clearStatus(old);clearStatus(m);p.switchedAt=game.totalTurns;old.slot=m.slot;p.active=m;p.bench[i]=old;m.entered=p.turns;}
  async function onEnter(owner){const p=game.players[owner],q=game.players[1-owner],m=p.active;
    await beat('switch',p.label+'换上'+info(m).name,{target:m.uid},450);
    if(info(m).ability==='快充'&&game.current===owner){
      if(networkHooks?.role==='server')await networkMovement(owner,'快充',p.bench.filter(x=>x.energy.length),[m]);else if(owner===0&&window.requestAnimationFrame)await moveEnergyUI('快充',p.bench.filter(x=>x.energy.length),[m]);else {let again=true;while(again){const donors=p.bench.filter(x=>x.energy.length);
        const donor=await chooseMon(owner,'快充：选择转移能量的精灵（可跳过）',donors,true);
        if(!donor)break;const t=await choose(owner,'选择移动的能量',donor.energy.map((t,i)=>({value:i,label:t+'能量',score:1})),true);
        if(t===null)break;m.energy.push(donor.energy.splice(t,1)[0]);
        await beat('energy','快充：移动1个能量',{target:m.uid},350);}}}
    if(info(m).ability==='哨兵'){
      const uid=await choose(owner,'哨兵：选择对方精灵',monOptions(q,mons(q)).map(o=>({...o,
        score:20>=(info(byUid(q,o.value)).hp-byUid(q,o.value).damage)?1000:20})));
      const target=byUid(q,uid);if(target){await beat('ability','哨兵',{cardId:m.id,subtitle:'对'+info(target).name+'造成20伤害'},600);
        recordContribution(owner,m,20,target);target.damage+=20;log('哨兵对'+info(target).name+'造成20伤害。');
        await beat('damage',info(target).name+'受到20伤害',{target:target.uid,amount:'20'},700);}}
  }
  async function resolveKO(){for(let owner=0;owner<2;owner++){
    const p=game.players[owner];for(const m of mons(p))if(m.damage>=info(m).hp){
      const loss=Math.min(p.magic,(/ex|gx/i.test(info(m).name)?2:1)+(m.extraMagicLoss||0));
      await beat('ko',info(m).name+'被击倒',{target:m.uid},450);
      const koEnergyCount=m.energy.length;await discardEnergyIndices(p,m,m.energy.map((_,i)=>i));
      await beat('koTransfer','移入'+p.label+'的弃牌区',{target:m.uid,cardId:m.id,owner,stackCount:m.stack.length,energyCount:koEnergyCount},1000);
      p.magic=Math.max(0,p.magic-loss);
      p.discard.push(...m.stack);if(m.tool)p.discard.push(m.tool);p.discardEnergy.push(...m.energy);
      log(`${p.label}的${info(m).name}被击倒，失去${loss}点魔力。`);
      if(p.active===m)p.active=null;else p.bench.splice(p.bench.indexOf(m),1);
      await beat('magic',p.label+'失去'+loss+'点魔力',{owner,loss},1450);
    }
  }
    const dead=game.players.map(p=>p.magic<=0||(!p.active&&!p.bench.length));
    if(dead.some(Boolean)){game.winner=dead.every(Boolean)?'平局':game.players[dead[0]?1:0].label+'获胜';log(game.winner);
      await beat('win',game.winner,{subtitle:'对战结束'},1000);return;}
    for(let owner=0;owner<2;owner++){const p=game.players[owner];if(!p.active){
      const m=await chooseMon(owner,'选择接替出战的精灵',p.bench);await promoteBench(owner,m);await onEnter(owner);
      // 哨兵可能再次造成击倒，需要继续结算。
      if(mons(game.players[1-owner]).some(x=>x.damage>=info(x).hp))return resolveKO();}}
  }
  function legalActions(owner){if(!game||game.winner||game.phase!=='play'||game.current!==owner||!game.players[owner].active)return [];
    const p=game.players[owner],q=game.players[1-owner],a=[];
    p.hand.forEach((id,i)=>{const c=card(id);
      if(c.stage==='基础'&&p.bench.length<RULES.bench)a.push({type:'basic',i});
      if(c.evolvesFrom&&p.turns>1)for(const m of mons(p))
        if(info(m).name===c.evolvesFrom&&m.born<p.turns&&m.evolved<p.turns)a.push({type:'evolve',i,uid:m.uid});
      if(c.category!=='精灵'&&!(c.category==='人物'&&p.supporter)&&trainerUsable(p,q,c.id))a.push({type:'trainer',i});
    });
    if(p.nextEnergy&&!p.attached)for(const m of mons(p))a.push({type:'attach',uid:m.uid});
    for(const m of mons(p)){const ability=info(m).ability;if((p.usedAbilities||[]).includes(m.uid))continue;
      if(ability==='氧循环'&&mons(p).some(x=>info(x).attribute==='草'&&x.damage>0)||ability==='最好的伙伴'||ability==='绒粉星光'&&q.bench.length||ability==='莫比乌斯'&&p.hand.length)a.push({type:'ability',uid:m.uid});}
    if(p.bench.length<RULES.bench)p.discard.forEach((id,i)=>{if(card(id)?.ability==='不朽')a.push({type:'revive',i});});
    if(!p.retreated&&!p.active.status.some(t=>t==='睡眠'||t==='麻痹')&&effectiveEnergy(p,p.active).length>=Math.max(0,info(p.active).retreat-(p.wind||0)))
      for(const m of p.bench)a.push({type:'retreat',uid:m.uid});
    if(!(RULES.firstPlayerNoAttack&&game.totalTurns===1))for(const name of info(p.active).skills)
      if(canAttack(p,p.active,name))a.push({type:'attack',name});
    a.push({type:'end'});return a;
  }
  function candyTargets(p,c){if(p.turns<=1||c.stage!=='二阶')return [];const middle=cards.find(x=>x.category==='精灵'&&x.name===c.evolvesFrom);if(!middle)return [];return mons(p).filter(m=>info(m).stage==='基础'&&info(m).name===middle.evolvesFrom&&m.born<p.turns&&m.evolved<p.turns);}
  function a1Usable(p,q,c){switch(c.name){
    case '兰斯洛':return p.bench.some(m=>m.energy.length);
    case '斯诺克':case '皮卡':case '格里芬':return true;
    case '魔力果':return p.hand.some(id=>candyTargets(p,card(id)).length);
    case '精灵盒子':return p.hand.some(id=>card(id).category==='精灵');
    case '尖刺头盔':case '精灵护符':return mons(p).some(m=>!m.tool);
    default:return false;}}
  async function pickSearch(owner,p,predicate){const options=p.deck.map((id,i)=>({id,i})).filter(x=>predicate(card(x.id))).map(x=>({value:x.i,cardId:x.id,label:card(x.id).name,score:searchScore(p,x.id)}));if(!options.length)options.push({value:null,label:'完成检索',score:0});return choose(owner,'选择加入手牌的精灵（向对方展示）',options,true);}
  async function a1Trainer(owner,index,targetUid=null){const p=game.players[owner],q=game.players[1-owner],id=p.hand[index],c=card(id);let target=null,chosenIndex=null,energyIndex=null;
    if(c.category==='道具'){target=targetUid===null?await chooseMon(owner,'选择附加'+c.name+'的精灵',mons(p).filter(m=>!m.tool),true):byUid(p,targetUid);if(!target||target.tool)return false;}
    if(c.name==='兰斯洛'){target=await chooseMon(owner,'兰斯洛：选择备战区供能精灵',p.bench.filter(m=>m.energy.length),true);if(!target)return false;energyIndex=await choose(owner,'选择移动到战斗区的能量',target.energy.map((t,i)=>({value:i,kind:'energy',energy:t,label:t+'能量',score:1})),true);if(energyIndex===null)return false;}
    if(c.name==='魔力果'){chosenIndex=await choose(owner,'魔力果：选择二阶精灵',p.hand.map((cid,i)=>({cid,i})).filter(x=>candyTargets(p,card(x.cid)).length).map(x=>({value:x.i,kind:'handCard',targets:candyTargets(p,card(x.cid)).map(m=>m.uid),cardId:x.cid,label:card(x.cid).name,score:card(x.cid).hp})),true);if(chosenIndex===null)return false;target=await chooseMon(owner,'魔力果：选择对应基础精灵',candyTargets(p,card(p.hand[chosenIndex])),true);if(!target)return false;}
    if(c.name==='精灵盒子'){chosenIndex=await choose(owner,'精灵盒子：选择放回卡组的精灵',p.hand.map((cid,i)=>({cid,i})).filter(x=>card(x.cid).category==='精灵').map(x=>({value:x.i,kind:'handCard',cardId:x.cid,label:card(x.cid).name,score:1})),true);if(chosenIndex===null)return false;}
    if(owner===1)await opponentPlayFlight(id,index);p.hand.splice(index,1);if(chosenIndex!==null&&chosenIndex>index)chosenIndex--;
    if(c.category==='人物')p.supporter=true;log(p.label+'使用'+c.name+'。');const before=snapshot();await beat('card',p.label+'使用'+c.name,{owner,cardId:id,subtitle:c.effect},1000);
    if(c.category==='道具'){target.tool=id;await beat('ability','附加'+c.name,{owner,target:target.uid,cardId:id},650);render();return true;}
    await usedCardDiscard(owner,id);
    switch(c.name){
      case '兰斯洛':{const t=target.energy.splice(energyIndex,1)[0];p.active.energy.push(t);await beat('energy','兰斯洛：移动'+t+'能量',{owner,target:p.active.uid},550);break;}
      case '斯诺克':p.wind=(p.wind||0)+2;break;
      case '皮卡':{const n=q.hand.length;p.deck.push(...p.hand);p.hand=[];shuffle(p.deck);await beat('shuffle','皮卡：重洗卡组',{owner},900);await animatedDraw(owner,n);break;}
      case '格里芬':{const i=await pickSearch(owner,p,x=>x.category==='精灵'&&/ex/i.test(x.name));if(i!==null)await animatedDraw(owner,1,1450,i,true);shuffle(p.deck);await beat('shuffle','格里芬：重洗卡组',{owner},900);break;}
      case '魔力果':{const evo=p.hand[chosenIndex];await evolveFlight(owner,target,evo,chosenIndex);p.hand.splice(chosenIndex,1);target.id=evo;target.stack.push(evo);target.evolved=p.turns;clearStatus(target);refreshAuras();log('魔力果：进化为'+info(target).name+'。');break;}
      case '精灵盒子':{const returned=p.hand.splice(chosenIndex,1)[0];await beat('card','精灵盒子：展示并放回'+card(returned).name,{owner,cardId:returned},900);p.deck.push(returned);const i=await pickSearch(owner,p,x=>x.category==='精灵');if(i!==null)await animatedDraw(owner,1,1450,i,true);shuffle(p.deck);await beat('shuffle','精灵盒子：重洗卡组',{owner},900);break;}
    }await showChanges(before);return true;
  }
  async function a1Ability(owner,uid){const p=game.players[owner],q=game.players[1-owner],m=byUid(p,uid),name=info(m).ability;let target=null,i=null;
    if(name==='绒粉星光'){target=await chooseMon(1-owner,'绒粉星光：选择自己的备战精灵出战',q.bench);if(!target)return false;}
    if(name==='莫比乌斯'){i=await choose(owner,'莫比乌斯：选择丢弃的手牌',p.hand.map((id,i)=>({value:i,cardId:id,label:card(id).name,score:1})),true);if(i===null)return false;}
    p.usedAbilities.push(uid);const before=snapshot();await beat('ability',name,{owner,cardId:m.id,target:m.uid},650);
    if(name==='最好的伙伴'){await extraAttach(owner,name,'光',1,[m]);await showChanges(before);await resolveKO();if(!game.winner)await finishTurn(owner);}
    if(name==='绒粉星光'){await forcedSwitch(q,target);await onEnter(1-owner);await resolveKO();}
    if(name==='莫比乌斯'){p.discard.push(p.hand.splice(i,1)[0]);await animatedDraw(owner,1);}
    return true;
  }
  async function dealSkillDamage(owner,m,target,base){const p=game.players[owner],q=game.players[1-owner],amount=attackDamage(p,q,m,target,base);if(!amount)return 0;target.damage+=amount;recordContribution(owner,m,amount,target);await beat('damage',info(target).name+'受到'+amount+'伤害',{owner:1-owner,target:target.uid,amount:String(amount)},650);
    if(target===q.active&&card(target.tool)?.name==='尖刺头盔'){const returned=directHP(m,20);if(returned)await beat('damage','尖刺头盔反伤20',{owner,target:m.uid,amount:'20'},550);}
    if(target===q.active&&target.damage>=info(target).hp&&info(m).ability==='付给恶魔的代价')target.extraMagicLoss=1;return amount;}
  async function a1AttackEffects(owner,m,victim,name){const p=game.players[owner],q=game.players[1-owner];
    switch(name){
      case '摇篮曲':victim.lullaby=q.turns+1;break;
      case '啮合传递':await extraAttach(owner,name,'钢',1,[m]);break;
      case '主轴':if(p.bench.length){const target=await chooseMon(owner,'主轴：选择附加两个钢能量的备战精灵',p.bench);await extraAttach(owner,name,'钢',2,[target]);}break;
      case '藏入箱中':if(await tossCoin(name)){m.protectedFrom=game.totalTurns+1;m.protectedUntil=game.totalTurns+1;}break;
      case '魔能爆':await discardEnergyIndices(p,m,m.energy.map((_,i)=>i));break;
      case '超维投射':for(const target of q.bench.slice())await dealSkillDamage(owner,m,target,20);break;
      case '咆哮':await extraAttach(owner,name,'水',1,[m]);await extraAttach(owner,name,'斗',1,[m]);break;
      case '龙息环爆':{const targets=mons(q).slice(),hits=new Map();for(let i=0;i<4;i++){const target=random(targets);hits.set(target,(hits.get(target)||0)+1);}for(const [target,times] of hits)await dealSkillDamage(owner,m,target,times*50);break;}
      case '升龙咆哮':m.attackLock=p.turns+1;break;
      case '腐蚀酸液':case '感染病':applyStatus(1-owner,victim.uid,'中毒');break;
    }
  }

  function trainerUsable(p,q,id){const c=card(id);if(!id.startsWith('A0-'))return a1Usable(p,q,c);const n=num(id);
    if([34,38,39,42].includes(n))return mons(p).some(m=>
      (m.damage>0||n===34&&m.status.length)&& (n!==38||info(m).attribute==='草')&& (n!==39||m.energy.includes('水')));
    if(n===32)return q.bench.some(m=>m.damage>0);
    if(n===33)return !!q.bench.length;
    if(n===40||n===41)return true;
    if(n===45)return p.discardEnergy.includes('火')&&info(p.active).attribute==='火';
    if(n===46)return mons(p).some(m=>info(m).attribute==='电');
    if(n===47)return info(p.active).attribute==='斗';
    return true;
  }
  async function trainer(owner,index,targetUid=null){const p=game.players[owner],q=game.players[1-owner];
    const id=p.hand[index],c=card(id);if(!id.startsWith('A0-'))return a1Trainer(owner,index,targetUid);const n=num(id);let target,chosen;
    const before=snapshot();
    if([34,38,42].includes(n)){const list=mons(p).filter(m=>(n!==38||info(m).attribute==='草')&&(m.damage>0||n===34&&m.status.length));
      {const options=monOptions(p,list).map(o=>({...o,score:byUid(p,o.value).damage}));
        const uid=targetUid===null?await choose(owner,'选择'+c.name+'的目标',options,true):targetUid;if(!options.some(o=>o.value===uid))return false;if(uid===null)return false;chosen=byUid(p,uid);}}
    if(n===32){const opts=monOptions(q,q.bench.filter(x=>x.damage>0));const uid=targetUid===null?await choose(owner,'恩佐：选择对方受伤的备战精灵',opts,true):targetUid;if(!opts.some(o=>o.value===uid))return false;
      if(uid===null)return false;target=byUid(q,uid);}
    if(owner===1)await opponentPlayFlight(id,index);p.hand.splice(index,1);if(c.category==='人物')p.supporter=true;
    log(p.label+'使用'+c.name+'。');
    if(owner!==1)await beat('card',p.label+'使用'+c.name,{cardId:id,owner,index,subtitle:c.effect},n===40||n===41?1250:850);
    await usedCardDiscard(owner,id);
    switch(n){
      case 31:await animatedDraw(owner,2);break;
      case 32:await forcedSwitch(q,target);await onEnter(1-owner);break;
      case 33:target=await chooseMon(1-owner,'路易斯：选择自己的精灵出战',q.bench);await forcedSwitch(q,target);await onEnter(1-owner);break;
      case 34:heal(chosen,30);clearStatus(chosen);break;
      case 35:p.deck.push(...p.hand);p.hand=[];shuffle(p.deck);
        await beat('shuffle',p.label+'将手牌放回并重洗卡组',{owner},450);await animatedDraw(owner,4);break;
      case 36:p.exBuff=(p.exBuff||0)+20;break;
      case 37:p.buff=(p.buff||0)+10;break;
      case 38:heal(chosen,50);break;
      case 39:mons(p).filter(m=>m.energy.includes('水')).forEach(m=>heal(m,40));break;
      case 40:case 41:{let amount=1;if(n===41){const head=await tossCoin('高级咕噜球 · 投掷1次硬币');
        amount=head?1:0;log('高级咕噜球：'+(head?'正面':'反面')+'。');
        await beat('coin',head?'正面':'反面',{coin:head?'正':'反',subtitle:head?'选择1只精灵加入手牌':'本次未获得精灵'},800);}
        for(let j=0;j<amount;j++){const opts=p.deck.map((id,i)=>({id,i})).filter(x=>
          n===40?card(x.id).stage==='基础':card(x.id).stage==='一阶').map(x=>({value:x.i,label:card(x.id).name,
            cardId:x.id,score:searchScore(p,x.id)}));
          if(!opts.length){log(c.name+'：牌库没有符合条件的精灵。');opts.push({value:null,label:'完成检索',score:0});}
          const i=await choose(owner,'选择加入手牌的精灵（向对方展示）',opts,true);if(i===null)break;
          const got=p.deck[i];log(p.label+'展示并获得'+card(got).name+'。');
          await animatedDraw(owner,1,1450,i,true);}
        if(amount===0)break;
        shuffle(p.deck);await beat('shuffle',p.label+'重洗卡组',{owner},900);break;}
      case 42:heal(chosen,20);break;
      case 43:q.deck.push(...q.hand);q.hand=[];shuffle(q.deck);
        await beat('shuffle',q.label+'将手牌放回卡组',{owner:1-owner},450);await animatedDraw(1-owner,p.magic);break;
      case 44:p.wind=(p.wind||0)+1;break;
      case 45:await extraAttach(owner,'火焰补丁：回收火能量','火',1,[p.active].filter(m=>info(m).attribute==='火'),false);p.discardEnergy.splice(p.discardEnergy.indexOf('火'),1);break;
      case 46:if(await tossCoin('电气连接 · 投掷硬币')){
        log('电气连接：正面。');
        await beat('coin','正面',{coin:'正',subtitle:'选择1只己方电系精灵附加电能量'},800);
        await extraAttach(owner,'电气连接','电',1,mons(p).filter(m=>info(m).attribute==='电'));}
        else {log('电气连接：反面。');await beat('coin','反面',{coin:'反',subtitle:'本次没有附加能量'},800);}break;
      case 47:p.fightBuff=(p.fightBuff||0)+10;break;
      default:throw new Error('未实现的卡牌：'+c.name);
    }await showChanges(before);
    if([36,37,44,47].includes(n))await beat('effect',c.name+'效果生效',{subtitle:c.effect},500);
    return true;
  }
  function searchScore(p,id){const c=card(id);
    if(c.evolvesFrom&&mons(p).some(m=>info(m).name===c.evolvesFrom))return 180+c.hp;
    if(c.stage==='基础')return (mons(p).length<2?200:40)+c.hp;
    if(c.evolvesFrom&&p.hand.some(id=>card(id).name===c.evolvesFrom))return 100+c.hp;
    return 20;}
  function energyTarget(p,list=mons(p)){return list.slice().sort((a,b)=>energyScore(p,b)-energyScore(p,a))[0];}
  function energyScore(p,m){const c=info(m),max=Math.max(...c.skills.map(s=>costFor(p,m,s).length));
    let s=scoreMon(p,m)+(p.active===m?50:0);if(effectiveEnergy(p,m).length>=max)s-=220;
    if(c.hp-m.damage<=30)s-=100;return s;}
  async function attackWindup(m,release){if(speed===0||!window.requestAnimationFrame){await release();return;}
    const node=arena.querySelector('[data-uid="'+m.uid+'"]');if(!node){await release();return;}const rect=node.getBoundingClientRect();let board=arena.querySelector('#battleTable');const owner=game.players[0].active===m?0:1,direction=owner===0?-1:1,current={type:'attackWindup',source:m.uid},token=generation;
    scene=current;const ghost=el('div',undefined,'attack-windup-flight heavy-attack-flight');ghost.append(artwork(info(m),'attack-windup-'+m.uid));ghost.style.width=rect.width+'px';ghost.style.height=rect.height+'px';ghost.style.left=rect.x+'px';ghost.style.top=rect.y+'px';ghost.style.transformOrigin='50% 85%';document.body.append(ghost);node.style.visibility='hidden';
    const raised=`perspective(550px) translate(-15px,-85px) scale(1.7) rotateX(${direction*55}deg) rotateY(-34deg) rotateZ(-12deg)`,slam=`perspective(550px) translate(16px,${direction*50}px) scale(1.45,1.05) rotateX(${-direction*72}deg) rotateY(18deg) rotateZ(5deg)`;
    const motion=ghost.animate([{transform:'perspective(550px) translate(0,0) scale(1) rotateX(0deg)',offset:0,easing:'cubic-bezier(.2,.7,.2,1)'},{transform:raised,offset:.3},{transform:raised,offset:.55,easing:'cubic-bezier(.65,0,1,.3)'},{transform:slam,offset:.66,easing:'ease-out'},{transform:`perspective(550px) translate(4px,${direction*12}px) scale(1.16) rotateX(${-direction*20}deg)`,offset:.81},{transform:'perspective(550px) translate(0,0) scale(1) rotateX(0deg)',offset:1}],{duration:1300*speed,fill:'forwards'});
    const effects=[],animations=[];let effectTask=null;
    try{await sleep(858);if(token!==generation)throw new Error('对局已结束');effectTask=release();board=arena.querySelector('#battleTable');const live=arena.querySelector('[data-uid="'+m.uid+'"]');if(live)live.style.visibility='hidden';const x=rect.x+rect.width/2,y=rect.y+rect.height/2+direction*50;
      const ring=el('div',undefined,'slam-impact-ring');ring.style.left=x+'px';ring.style.top=y+'px';document.body.append(ring);effects.push(ring);animations.push(ring.animate([{transform:'translate(-50%,-50%) scale(.2)',opacity:1},{transform:'translate(-50%,-50%) scale(2.8)',opacity:0}],{duration:360*speed,fill:'forwards',easing:'ease-out'}));
      for(let i=0;i<10;i++){const ray=el('div',undefined,'slam-impact-ray'),angle=i*Math.PI/5;ray.style.left=x+'px';ray.style.top=y+'px';document.body.append(ray);effects.push(ray);animations.push(ray.animate([{transform:`rotate(${angle}rad) translateX(10px) scaleX(.4)`,opacity:1},{transform:`rotate(${angle}rad) translateX(110px) scaleX(1.4)`,opacity:0}],{duration:280*speed,fill:'forwards',easing:'ease-out'}));}
      if(board){animations.push(board.animate([{transform:'translate(0,0)',filter:'brightness(1)'},{transform:'translate(-6px,4px)',filter:'brightness(1.5)',offset:.18},{transform:'translate(6px,-4px)',filter:'brightness(1.12)',offset:.36},{transform:'translate(-4px,2px)',filter:'brightness(1)',offset:.58},{transform:'translate(2px,-1px)',offset:.8},{transform:'translate(0,0)',filter:'brightness(1)'}],{duration:270*speed}));}await sleep(442);if(token!==generation)throw new Error('对局已结束');
    }finally{motion.cancel();animations.forEach(a=>a.cancel());effects.forEach(n=>n.remove());ghost.remove();node.style.visibility='';const live=arena.querySelector('[data-uid="'+m.uid+'"]');if(live)live.style.visibility='';if(scene===current)scene=null;}if(effectTask)await effectTask;}
  async function useAttack(owner,name){const p=game.players[owner],q=game.players[1-owner],m=p.active;
    if(m.status.includes('混乱')&&!await tossCoin('混乱',{target:m.uid,statusType:'混乱'})){log(info(m).name+'因混乱攻击失败。');await finishTurn(owner);return;}
    if(name==='疾风连袭'){const options=[...new Set(p.bench.flatMap(x=>info(x).skills).filter(k=>k==='水刃'||k==='闪击'))].map(k=>({value:k,label:k,score:damageFor(p,q,m,k)}));const copied=await choose(owner,'疾风连袭：选择借用的技能',options);if(!copied)return;name=copied;}
    const before=snapshot(),effect=SKILLS[name][2],victim=q.active;let n=damageFor(p,q,m,name);
    if(['铁蒺藜','音波弹','连续毒针','乱打'].includes(name)){const times=name==='连续毒针'?2:name==='乱打'?3:m.energy.length;let heads=0;for(let i=0;i<times;i++)if(await tossCoin(name+' · '+(i+1)+'/'+times))heads++;n=attackDamage(p,q,m,victim,(name==='乱打'?70:0)+heads*(name==='铁蒺藜'?40:20));}

    await attackWindup(m,()=>beat('attackFx',name,{source:m.uid,target:n>0?victim.uid:m.uid,attribute:info(m).attribute,charging:n===0,subtitle:n>0?'命中 '+info(victim).name:'技能效果发动'},750));
    recordContribution(owner,m,n,victim);victim.damage+=n;
    if(victim.damage>=info(victim).hp&&info(m).ability==='付给恶魔的代价'&&n>0)victim.extraMagicLoss=1;

    const extra=SKILLS[name][3];if(extra?.status)for(const type of [extra.status].flat())applyStatus(1-owner,victim.uid,type);
    log(`${p.label}的${info(m).name}使用${name}，造成${n}伤害。`);
    if(n>0)await beat('damage',info(victim).name+'受到'+n+'伤害',{target:victim.uid,amount:String(n)},800);
    if(n>0&&card(victim.tool)?.name==='尖刺头盔'){const returned=directHP(m,20);if(returned)await beat('damage','尖刺头盔反伤20',{target:m.uid,amount:'20'},600);}

    if(effect==='a1')await a1AttackEffects(owner,m,victim,name);
    if(effect==='grow')await extraAttach(owner,'生长：附加2个草能量','草',2,[m]);
    if(effect==='heal20')heal(m,20);
    if(effect==='discard1')await discardEnergy(p,m,'火',1);
    if(effect==='discard2')await discardEnergy(p,m,'火',2);
    if(effect==='growFire')await extraAttach(owner,'附加1个火能量','火',1,[m]);
    if(effect==='transfer'&&p.bench.length&&m.energy.length){
      if(networkHooks?.role==='server')await networkMovement(owner,'感电',[m],p.bench,true);else if(owner===0&&window.requestAnimationFrame)await moveEnergyUI('感电',[m],p.bench,true);else {const target=await chooseMon(owner,'感电：选择接收能量的备战精灵（可跳过）',p.bench,true);
      if(target){let more=true;while(more&&m.energy.length){const i=await choose(owner,'选择转移的能量（可停止）',
        m.energy.map((t,i)=>({value:i,label:t+'能量',score:1})),true);if(i===null)break;target.energy.push(m.energy.splice(i,1)[0]);
        await beat('energy','移动1个能量到'+info(target).name,{target:target.uid},350);}}}}
    if(effect==='recycleSwitch'&&p.bench.length){const target=await chooseMon(owner,'加大功率：选择接收能量并出战的精灵',p.bench);
      for(let k=0;k<2&&p.discardEnergy.length;k++){const i=await choose(owner,'选择回收的能量（可跳过）',
        p.discardEnergy.map((t,i)=>({value:i,label:t+'能量',score:1})),true);if(i===null)break;target.energy.push(p.discardEnergy.splice(i,1)[0]);
        await beat('energy','回收1个能量到'+info(target).name,{target:target.uid},350);}
      await forcedSwitch(p,target);await onEnter(owner);}
    if(effect==='switch'&&p.bench.length){const target=await chooseMon(owner,'闪击折返：选择出战精灵',p.bench);await forcedSwitch(p,target);await onEnter(owner);}
    await showChanges(before,false);
    if(effect==='discard1'||effect==='discard2')await beat('discard','丢弃'+(effect==='discard1'?1:2)+'个火能量',{target:m.uid},450);
    await resolveKO();if(!game.winner){await beat('end',owner===0?'我的回合结束':'对手的回合结束',{},450);await finishTurn(owner);}
  }
  async function perform(owner,a){const compared={...a};delete compared.slot;delete compared.targetUid;
    const legal=legalActions(owner).some(x=>JSON.stringify(x)===JSON.stringify(compared));if(!legal)return false;
    const p=game.players[owner];
    if(networkHooks?.role==='server'&&a.type==='basic')await networkHooks.event({type:'networkBasic',owner,index:a.i,cardId:p.hand[a.i],slot:a.slot??firstSlot(p),duration:1350});
    if(a.type==='basic'){const slot=a.slot===undefined?firstSlot(p):a.slot;
      if(![0,1,2].includes(slot)||p.bench.some(m=>m.slot===slot))return false;
      if(owner===1){const destination=arena.querySelector('[data-owner-zone="1"] .bench-row')?.children[slot]?.getBoundingClientRect();await opponentPlayFlight(p.hand[a.i],a.i,destination);}
      const id=p.hand.splice(a.i,1)[0],m=createMon(id,p);putBench(p,m,slot);log(p.label+'放置'+card(id).name+'。');
      refreshAuras();await beat('place',p.label+'放置'+card(id).name,{target:m.uid},500);}
    if(a.type==='evolve'){const m=byUid(p,a.uid),id=p.hand[a.i];if(owner===1)await opponentPlayFlight(id,a.i);await evolveFlight(owner,m,id,a.i);p.hand.splice(a.i,1);m.id=id;m.stack.push(id);m.evolved=p.turns;
      clearStatus(m);refreshAuras();log(p.label+'进化为'+info(m).name+'。');
      render();const node=arena.querySelector('[data-uid="'+m.uid+'"]');if(speed>0&&node?.animate)node.animate([{filter:'brightness(1.5)',transform:'scale(1.04)'},{filter:'brightness(1)',transform:'scale(1)'}],{duration:250*speed});}
    if(a.type==='attach'){const m=byUid(p,a.uid),before=snapshot();addEnergy(p,m,p.nextEnergy);p.attached=true;
      log(p.label+'给'+info(m).name+'附加'+p.nextEnergy+'能量。');await showChanges(before);}
    if(a.type==='revive'){const id=p.discard.splice(a.i,1)[0],m=createMon(id,p);putBench(p,m);const victim=game.players[1-owner].active,damage=directHP(victim,10);if(damage)await beat('damage','不朽扣除10HP',{target:victim.uid,amount:'10'},650);refreshAuras();log(p.label+'发动不朽，复活寂灭骨龙。');await beat('ability','不朽',{cardId:id,target:m.uid},750);await resolveKO();}
    if(a.type==='ability'&&info(byUid(p,a.uid)).ability!=='氧循环'){if(!await a1Ability(owner,a.uid))return false;}
    if(a.type==='ability'&&info(byUid(p,a.uid)).ability==='氧循环'){const opts=monOptions(p,mons(p).filter(m=>info(m).attribute==='草'&&m.damage>0))
      .map(o=>({...o,score:byUid(p,o.value).damage}));
      const uid=await choose(owner,'氧循环：选择恢复30HP的草精灵',opts,true);if(uid===null)return false;
      const before=snapshot();await beat('ability','氧循环',{cardId:byUid(p,a.uid).id,subtitle:'回复30HP'},600);
      heal(byUid(p,uid),30);p.usedAbilities.push(a.uid);log('氧循环恢复30HP。');await showChanges(before);}
    if(a.type==='trainer'){if(!await trainer(owner,a.i,a.targetUid??null))return false;await resolveKO();}
    if(a.type==='retreat'){const cost=Math.max(0,info(p.active).retreat-(p.wind||0));
      // 浸润提供的双份水能量也可支付撤退；弃牌区只放实际丢弃的能量。
      let paid=0;while(paid<cost){const doubled=info(p.active).attribute==='水'&&
        mons(p).some(m=>info(m).ability==='浸润');
        const i=new Set(p.active.energy).size===1?0:await choose(owner,'选择丢弃的撤退能量（还需'+(cost-paid)+'）',
          p.active.energy.map((t,i)=>({value:i,kind:'energy',energy:t,doubled:t==='水'&&doubled,label:t+'能量'+(t==='水'&&doubled?'（视为2个）':''),score:1})));
        const t=p.active.energy[i];paid+=t==='水'&&doubled?2:1;await discardEnergyIndices(p,p.active,[i]);}
      await forcedSwitch(p,byUid(p,a.uid),true);p.retreated=true;log(p.label+'撤退，换上'+info(p.active).name+'。');await onEnter(owner);await resolveKO();}
    if(a.type==='attack')await useAttack(owner,a.name);
    if(a.type==='end'){log(p.label+'结束回合。');await beat('end',owner===0?'我的回合结束':'对手的回合结束',{},450);await finishTurn(owner);}
    refreshAuras();if(!game.winner)await resolveKO();return true;
  }
  async function energyReady(owner){const p=game.players[owner];if(networkHooks?.role==='server'&&p.nextEnergy)await networkHooks.event({type:'networkEnergyReady',owner,duration:550});if(!p.nextEnergy||speed===0||!window.requestAnimationFrame){p.energyPending=false;render();return;}
    const token=generation,current={type:'energyReady',owner};scene=current;render();
    const source=arena.querySelector('.rail-'+(owner===0?'human':'foe')+' .energy-next .energy-chip'),target=arena.querySelector('[data-anchor="energy-'+owner+'"] .energy-current');
    if(!source||!target){p.energyPending=false;scene=null;render();return;}const a=source.getBoundingClientRect(),b=target.getBoundingClientRect(),ghost=el('div',undefined,'ready-energy-flight');ghost.append(energyChip(p.nextEnergy));document.body.append(ghost);source.style.visibility='hidden';
    const x=b.x+b.width/2-15,y=b.y+b.height/2-15;
    const motion=ghost.animate([{transform:`translate(${a.x-6}px,${a.y-6}px) scale(.55)`},{transform:`translate(${a.x-6}px,${a.y-40}px) scale(1.2)`,offset:.4},{transform:`translate(${x}px,${y}px) scale(1.15)`,offset:.85},{transform:`translate(${x}px,${y}px) scale(${(window.innerWidth>650?54:38)*b.width/target.clientWidth/30})`}],{duration:550*speed,easing:'ease-in-out',fill:'forwards'});
    try{await sleep(550);if(token!==generation)throw new Error('对局已结束');}finally{motion.cancel();ghost.remove();p.energyPending=false;if(scene===current)scene=null;}render();
    arena.querySelector('[data-anchor="energy-'+owner+'"]')?.animate([{boxShadow:'0 0 25px #78d9ff'},{boxShadow:'0 0 0px transparent'}],{duration:400*speed});
  }
  async function beginTurn(owner){if(game.winner)return;
    game.current=owner;game.totalTurns++;if(game.totalTurns>RULES.turnLimit){game.winner='回合上限，平局';log(game.winner);return;}
    const p=game.players[owner];p.turns++;p.attached=false;p.retreated=false;p.supporter=false;
    p.usedAbilities=[];p.buff=0;p.exBuff=0;p.fightBuff=0;p.wind=0;
    p.nextEnergy=RULES.firstPlayerNoEnergy&&game.totalTurns===1?null:p.forecast;p.energyPending=!!p.nextEnergy;
    if(p.nextEnergy)p.forecast=RULES.randomMixedEnergy?random(p.types):p.types[p.turns%p.types.length];
    log(`第${game.totalTurns}回合：${p.label}，能量${p.nextEnergy||'无（先手首回合）'}。`);
    await beat('turn',owner===0?'我的回合':'对手的回合',{subtitle:'第'+game.totalTurns+'回合'},1000);
    await animatedDraw(owner,1);
    await energyReady(owner);
  }
  async function start(human,computer){networkHooks=null;if(!validDeck(human)||!validDeck(computer))throw new Error('卡组不符合保存规则。');
    generation++;scene=null;targetChoice=null;selectedTarget=null;artNodes.clear();
    if(aiTimer!==null){clearTimeout(aiTimer);aiTimer=null;}
    game={players:[setupPlayer(clone(human),'玩家'),setupPlayer(clone(computer),'对手')],
      phase:'setup',revealed:false,current:0,totalTurns:0,winner:null,log:[]};showPage('battle');
    for(const p of game.players){p.deck.unshift(...p.hand);p.hand=[];}
    log('对战开始：'+human.name+' 对 '+computer.name+'。');render();
    const first=(await tossCoin('判定先后手'))?0:1;game.first=first;
    log(game.players[first].label+'先手。');
    await beat('coin',game.players[first].label+'先手',{coin:first===0?'正':'反'},800);
    await beat('opening','双方抽取5张初始手牌',{},650);
    await openingDeal();
    const setupPlayerAsync=async owner=>{const p=game.players[owner],setupGeneration=generation;
      if(owner===0&&window.requestAnimationFrame){await new Promise(resolve=>{chooser=resolve;targetChoice={setup:true,title:'初始布阵',options:[]};render();});return;}
      const basics=p.hand.map((id,i)=>({id,i})).filter(x=>card(x.id).stage==='基础');
      const i=await choose(owner,'选择初始出战精灵',basics.map(x=>({value:x.i,label:card(x.id).name,score:card(x.id).hp})));
      if(owner===1)await sleep(450);if(setupGeneration!==generation)return;
      p.active=createMon(p.hand.splice(i,1)[0],p);render();
      while(p.bench.length<RULES.bench){const opts=p.hand.map((id,i)=>({id,i})).filter(x=>card(x.id).stage==='基础');
        const j=await choose(owner,'选择初始备战精灵（可跳过）',opts.map(x=>({value:x.i,label:card(x.id).name,score:1})),true);
        if(j===null)break;if(owner===1)await sleep(350);if(setupGeneration!==generation)return;putBench(p,createMon(p.hand.splice(j,1)[0],p));render();}
    };
    await Promise.all([setupPlayerAsync(0),setupPlayerAsync(1)]);
    game.revealed=true;await beat('reveal','双方准备完成',{subtitle:'对战开始'},850);
    game.phase='play';await beginTurn(first);render();
  }
  function actionScore(owner,a){const p=game.players[owner],q=game.players[1-owner];
    if(a.type==='evolve')return 700+card(p.hand[a.i]).hp;
    if(a.type==='basic')return p.bench.length<2?500:80;
    if(a.type==='revive')return 1100;
    if(a.type==='ability')return 950;
    if(a.type==='attach')return 600+energyScore(p,byUid(p,a.uid));
    if(a.type==='trainer'){const n=num(p.hand[a.i]);
      if(n===-1){const name=card(p.hand[a.i]).name;if(['尖刺头盔','精灵护符'].includes(name))return 800;if(name==='魔力果')return 1300;if(name==='格里芬'||name==='精灵盒子')return 700;if(name==='兰斯洛')return 600;if(name==='斯诺克')return !p.retreated&&p.bench.length?250:0;if(name==='皮卡')return q.hand.length>p.hand.length-1?900:0;}
      if(n===31)return 1100;if(n===35)return p.hand.length<=3?1000:0;
      if(n===40||n===41)return 1050;if(n===45||n===46)return 900;
      if([34,38,39,42].includes(n))return 850;
      if(n===44)return !p.retreated&&p.bench.length&&p.active.energy.length<info(p.active).retreat?400:0;
      const attacks=info(p.active).skills.filter(s=>canAttack(p,p.active,s));
      if([36,37,47].includes(n)){const bonus=n===36?20:10;
        return attacks.some(s=>{const d=damageFor(p,q,p.active,s),hp=info(q.active).hp-q.active.damage;
          return d>0&&d<hp&&d+bonus>=hp&&(n!==36||/ex|gx/i.test(info(q.active).name));})?1200:0;}
      if(n===33||n===32)return 0;
      if(n===43)return q.hand.length>p.magic?300:0;return 0;}
    if(a.type==='retreat'){const m=byUid(p,a.uid);const old=info(p.active).skills.filter(s=>canAttack(p,p.active,s));
      const fresh=info(m).skills.filter(s=>canAttack(p,m,s));
      const best=x=>x.length?Math.max(...x.map(s=>damageFor(p,q,m,s))):0;
      const current=old.length?Math.max(...old.map(s=>damageFor(p,q,p.active,s))):0;
      const cost=Math.max(0,info(p.active).retreat-(p.wind||0));
      if(info(m).ability==='哨兵'&&mons(q).some(x=>info(x).hp-x.damage<=20))return 1400;
      if(best(fresh)>current+20+cost*20)return 550;
      const publicThreat=Math.max(...info(q.active).skills.map(s=>damageFor(q,p,q.active,s)));
      if(info(p.active).hp-p.active.damage<=publicThreat&&info(m).hp-m.damage>publicThreat&&fresh.length)return 500;
      return 0;}
    if(a.type==='attack'){const d=damageFor(p,q,p.active,a.name),hp=info(q.active).hp-q.active.damage;
      if(d>=hp)return 2000+(q.magic<=(/ex|gx/i.test(info(q.active).name)?2:1)?5000:0);
      return 150+d+(a.name==='盛开'?120:0)+(a.name==='吹火'?35:0);}
    return a.type==='end'?1:0;
  }
  async function aiTurn(token){if(networkHooks)return;if(token!==generation||!game||game.winner||game.current!==1||busy)return;
    busy=true;render();try{
      for(let i=0;i<60&&game.current===1&&!game.winner;i++){
        await sleep(350);
        const actions=legalActions(1).map(a=>({a,s:actionScore(1,a)})).sort((a,b)=>b.s-a.s);
        const picked=actions[0]?.a||{type:'end'};await perform(1,picked);
      }
      if(game.current===1&&!game.winner)await perform(1,{type:'end'});
    }catch(e){log('对手行动异常：'+e.message);if(!game.winner&&game.current===1)await beginTurn(0);console.error(e);}
    finally{busy=false;render();}
  }
  async function humanAction(a){if(networkHooks?.role==='client'){if(!busy&&game?.current===0&&!game.winner&&!targetChoice)networkHooks.send('action',{action:a});return;}if(busy||game.current!==0||game.winner||game.phase!=='play')return;busy=true;render();
    try{
      if(a.type==='basic'&&a.slot===undefined){const options=[0,1,2].filter(i=>!game.players[0].bench.some(m=>m.slot===i))
        .map(i=>({value:'slot-'+i,kind:'slot',label:'备战位置'+(i+1),score:1}));
        const slot=await choose(0,'选择放置基础精灵的备战位置',options,true);if(slot===null)return;
        a={...a,slot:Number(slot.split('-')[1])};}
      if(a.type==='end'||a.type==='attack'){
        const available=legalActions(0),notes=[];
        if(available.some(x=>x.type==='attach'))notes.push('本回合还可以附加能量');
        if(a.type==='end'&&available.some(x=>x.type==='attack'))notes.push('出战精灵还可以攻击');
        if(notes.length){const yes=await choose(0,notes.join('；')+'。确定'+(a.type==='attack'?'攻击并结束回合':'结束回合')+'？',
          [{value:true,label:'确定',score:1},{value:false,label:'返回继续操作',score:0}]);if(!yes)return;}
      }
      await perform(0,a);
    }catch(e){log('操作异常：'+e.message);console.error(e);}finally{busy=false;render();}}
  function artwork(c,key){const cacheKey=key+'-'+c.id;if(artNodes.has(cacheKey))return artNodes.get(cacheKey);
    const host=el('div',undefined,'table-art');host.setAttribute('aria-label',c.name+'卡图');
    loadImage(c.name,host);artNodes.set(cacheKey,host);return host;}
  const energyColors={草:'#91c87d',火:'#f3a270',水:'#7cb9ec',电:'#e8d16e',斗:'#d9ab81',幻:'#b99ddb',恶:'#819da2',光:'#f0ddb0',钢:'#b5c2c7',龙:'#b7a78c',无:'#c0c7d4'};
  function energyChip(t){const x=el('span',undefined,'energy-chip');x.style.setProperty('--energy-color',energyColors[t]||'#bbc6d0');x.title=t+'能量';
    loadImage(t+'属性能量',x);return x;}
  function energySummary(p,m){const types=[...new Set(m.energy)];
    const actual=types.map(t=>t+' × '+count(m.energy,t)).join('、')||'无';
    const effective=effectiveEnergy(p,m);
    return '实际附着：'+m.energy.length+'个（'+actual+'）'+
      (effective.length!==m.energy.length?'；技能需求视为：'+effective.length+'个（'+[...new Set(effective)].map(t=>t+' × '+count(effective,t)).join('、')+'）':'');}
  function coinFace(front){const face=el('div',undefined,'coin-face'+(front?' front':' back'));
    const img=el('img');img.alt=front?'硬币正面':'硬币反面';img.src='./'+encodeURIComponent(IMAGE_FOLDER)+'/coin-'+(front?'front':'back')+'.png';
    img.onerror=()=>{face.replaceChildren(el('span',front?'正':'反'));face.classList.add('coin-fallback');};face.append(img);return face;}
  let coinPreload=null;
  function preloadCoins(){if(coinPreload)return coinPreload;
    coinPreload=Promise.all(['front','back'].map(side=>new Promise(resolve=>{
      const img=new Image();let done=false;const finish=()=>{if(done)return;done=true;resolve();};
      img.onload=finish;img.onerror=finish;img.src='./'+encodeURIComponent(IMAGE_FOLDER)+'/coin-'+side+'.png';setTimeout(finish,1200);
    })));return coinPreload;}
  function coinView(){const host=el('div',undefined,'coin-stage'+(scene.toss?' tossing':''));
    const spin=el('div',undefined,'coin-body');spin.append(coinFace(true),coinFace(false));
    spin.children[0].style.transform='none';spin.children[1].style.transform='none';
    const flip=front=>{spin.children[0].style.display=front?'block':'none';spin.children[1].style.display=front?'none':'block';host.dataset.face=front?'front':'back';};
    flip(scene.coin!=='反');host.append(spin);
    if(scene.toss&&speed>0&&window.requestAnimationFrame){const current=scene;
      const frame=()=>{if(scene!==current||!host.isConnected)return;
        const progress=Math.min(1,(Date.now()-current.started)/current.duration),angle=(1-Math.pow(1-progress,1.5))*Math.PI*(current.landing==='反'?9:8);
        const cosine=Math.cos(angle);flip(cosine>=0);
        spin.style.transform='scaleX('+Math.max(.035,Math.abs(cosine))+') rotate('+(-12*(1-progress))+'deg)';
        host.style.transform='translateY('+(-95*Math.sin(Math.PI*progress)+30*(1-progress))+'px) scale('+(1+.12*Math.sin(Math.PI*progress))+')';
        host.dataset.progress=String(progress);
        if(progress<1)window.requestAnimationFrame(frame);
      };window.requestAnimationFrame(frame);
    }return host;}
  // Attribute-specific vector effects share only the public source/target geometry.
  const ATTACK_FX={
    草:{color:'#85ec81',shape:'<path d="M12 51C9 21 27 7 55 8C56 34 40 54 12 51Z"/><path d="M13 50L46 17" fill="none" stroke="white" stroke-width="3"/>',kind:'leaf',count:9},
    火:{color:'#ff913c',shape:'<path d="M32 3C42 19 58 29 51 47C45 65 14 65 9 44C6 29 20 22 21 11C25 21 29 23 32 3Z"/><path d="M32 27C44 40 44 52 31 57C20 53 19 43 32 27Z" fill="#fff2a0"/>',kind:'flame',count:8},
    水:{color:'#63d7ff',shape:'<path d="M32 3C23 18 8 31 8 42C8 69 56 69 56 42C56 31 41 18 32 3Z"/><path d="M18 40Q15 51 28 54" fill="none" stroke="white" stroke-width="4"/>',kind:'droplet',count:10},
    电:{color:'#ffe65f',shape:'<path d="M38 2L9 35H29L22 62L56 25H35Z" stroke="white" stroke-width="2"/>',kind:'bolt',count:6},
    斗:{color:'#e9ab75',shape:'<path d="M9 30L12 16H21V11H31V14H42V18H51L55 40L43 55H22L10 44Z"/><path d="M21 19V34M31 19V34M41 22V34M10 35H26L31 44" fill="none" stroke="#754426" stroke-width="3"/>',kind:'fist',count:3},
    幻:{color:'#d89aff',shape:'<ellipse cx="32" cy="32" rx="28" ry="12" fill="none" stroke="currentColor" stroke-width="4"/><ellipse cx="32" cy="32" rx="12" ry="28" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="32" cy="32" r="8" fill="white"/>',kind:'psychic',count:6},
    恶:{color:'#a17acc',shape:'<circle cx="32" cy="32" r="22" fill="#120e28" stroke="currentColor" stroke-width="4"/><path d="M6 24Q32 -1 54 18M58 40Q32 65 10 46" fill="none" stroke="currentColor" stroke-width="4"/><path d="M20 28L29 34L20 36M44 28L35 34L44 36" fill="#e5b7ff"/>',kind:'dark',count:7},
    光:{color:'#fff5ba',shape:'<path d="M32 0L38 25L64 32L38 39L32 64L25 39L0 32L25 25Z"/><circle cx="32" cy="32" r="9" fill="white"/>',kind:'light',count:10},
    钢:{color:'#bedcea',shape:'<path d="M51 3L43 31L26 49L15 38L33 20Z"/><path d="M9 36L29 56M19 46L7 58" fill="none" stroke="white" stroke-width="5"/>',kind:'steel',count:5},
    龙:{color:'#90b7ff',shape:'<path d="M5 53C12 28 34 52 27 29C21 8 47 4 59 9L49 17L60 23L41 24C57 52 22 40 5 53Z"/><path d="M36 15L32 2L45 8"/><circle cx="47" cy="14" r="2" fill="white"/>',kind:'dragon',count:6},
    无:{color:'#e4edf6',shape:'<path d="M32 3L40 21L60 18L47 34L59 51L39 47L31 63L24 45L4 48L17 31L7 14L25 20Z" fill="none" stroke="currentColor" stroke-width="4"/>',kind:'normal',count:5}
  };
  function fxConfig(attribute){return ATTACK_FX[attribute]||ATTACK_FX[{超:'幻',普:'无',机械:'钢',一般:'无',超能:'幻'}[attribute]]||ATTACK_FX.无;}
  function fxIcon(config){const x=el('div',undefined,'attack-particle fx-'+config.kind);x.style.color=config.color;
    x.innerHTML='<svg viewBox="0 0 64 64" fill="currentColor" xmlns="http://www.w3.org/2000/svg">'+config.shape+'</svg>';return x;}
  function playBoardEffects(board){if(!scene||!window.requestAnimationFrame||speed===0)return;
    const current=scene;
    window.requestAnimationFrame(()=>{if(scene!==current||!board.isConnected)return;
      const rect=board.getBoundingClientRect();
      const center=node=>{const r=node.getBoundingClientRect(),scale=rect.width/board.offsetWidth;return {x:(r.x-rect.x+r.width/2)/scale,y:(r.y-rect.y+r.height/2)/scale,width:r.width/scale,height:r.height/scale};};
      const targetNode=board.querySelector('[data-uid="'+current.target+'"]');
      if(current.type==='koTransfer'&&targetNode){const pile=board.querySelector('[data-anchor="discard-'+current.owner+'"]');if(!pile)return;
        const from=center(targetNode),to=center(pile),fly=el('div',undefined,'ko-flight');
        fly.style.cssText='left:'+from.x+'px;top:'+from.y+'px;width:'+from.width+'px;height:'+from.height+'px';
        fly.append(artwork(card(current.cardId),'ko-flight'));board.append(fly);targetNode.style.opacity='0';
        const label=el('div','精灵'+(current.stackCount>1?'及进化卡':'')+' · '+current.energyCount+'个能量','ko-flight-label');fly.append(label);
        fly.animate([{transform:'translate(-50%,-50%) scale(1)',opacity:1},{transform:'translate(-50%,-70%) rotate(-12deg) scale(1.07)',opacity:1,offset:.22},{transform:'translate(calc(-50% + '+(to.x-from.x)+'px),calc(-50% + '+(to.y-from.y)+'px)) rotate(18deg) scale(.25)',opacity:.7},{transform:'translate(calc(-50% + '+(to.x-from.x)+'px),calc(-50% + '+(to.y-from.y)+'px)) rotate(18deg) scale(.12)',opacity:0}],{duration:current.duration,fill:'forwards',easing:'ease-in-out'});
        pile.animate([{boxShadow:'0 0 0 transparent'},{boxShadow:'0 0 25px #b99ddb',offset:.85},{boxShadow:'0 0 0 transparent'}],{duration:current.duration});return;
      }
      if(current.type!=='attackFx'||!targetNode)return;
      const sourceNode=board.querySelector('[data-uid="'+current.source+'"]');if(!sourceNode)return;
      const from=center(sourceNode),to=center(targetNode),config=fxConfig(current.attribute),fx=el('div',undefined,'attribute-fx fx-'+config.kind);
      fx.dataset.attribute=current.attribute;fx.style.setProperty('--fx-color',config.color);board.append(fx);
      const ring=el('div',undefined,'impact-ring');ring.style.left=to.x+'px';ring.style.top=to.y+'px';fx.append(ring);
      const duration=current.duration,charging=current.charging;
      ring.animate([{transform:'translate(-50%,-50%) scale(.55)',opacity:1},{transform:'translate(-50%,-50%) scale(1.3)',opacity:1,offset:.18},{transform:'translate(-50%,-50%) scale(2.6)',opacity:0}],{duration:duration*.7,fill:'forwards',easing:'ease-out'});
      for(let i=0;i<config.count;i++){const particle=fxIcon(config),angle=i/config.count*Math.PI*2,spread=charging?46:24;
        const dx=Math.cos(angle)*spread,dy=Math.sin(angle)*spread;
        particle.style.left=from.x+'px';particle.style.top=from.y+'px';fx.append(particle);
        const scale=config.kind==='fist'?1.4:config.kind==='dragon'?1.25:.7+i%3*.15;
        const travel=config.kind==='bolt'?1:config.kind==='psychic'?1.6:config.kind==='steel'?.8:1.1;
        const bend=config.kind==='leaf'||config.kind==='dark'?Math.sin(angle)*80:config.kind==='dragon'?Math.cos(angle)*60:dx;
        particle.animate([{transform:'translate(-50%,-50%) scale(.8) rotate('+i*35+'deg)',opacity:1},{transform:'translate(calc(-50% + '+bend+'px),calc(-50% + '+((to.y-from.y)*.35+dy)+'px)) scale('+scale+') rotate('+(i*35+90*travel)+'deg)',opacity:1,offset:.12},{transform:'translate(calc(-50% + '+(to.x-from.x+dx)+'px),calc(-50% + '+(to.y-from.y+dy)+'px)) scale('+scale+') rotate('+(i*35+180*travel)+'deg)',opacity:1,offset:.32},{transform:'translate(calc(-50% + '+(to.x-from.x+dx*2)+'px),calc(-50% + '+(to.y-from.y+dy*2)+'px)) scale(.1)',opacity:0}],{duration:duration*.85,delay:0,fill:'both',easing:config.kind==='bolt'?'steps(5,end)':'ease-in-out'});
      }
      if(!charging)targetNode.animate([{filter:'brightness(2.5) drop-shadow(0 0 15px '+config.color+')'},{filter:'brightness(1.5)',offset:.25},{filter:'brightness(1)'}],{duration:duration*.6});
    });}
  let drag=null,suppressClickUntil=0,queuedHandDrop=null;
  function clearDrag(){if(!drag)return;drag.ghost?.remove();
    arena.querySelector('#battleTable')?.classList.remove('drag-dimming');arena.querySelectorAll('.drop-legal,.drop-hover').forEach(n=>n.classList.remove('drop-legal','drop-hover'));drag=null;}
  function placeSetup(index,slot=null){if(networkHooks?.role==='client'){networkHooks.send('setup',{index,slot});return true;}if(!targetChoice?.setup||game.phase!=='setup')return false;
    const p=game.players[0],id=p.hand[index];if(!id||card(id).stage!=='基础'||slot===null&&p.active||slot!==null&&(!Number.isInteger(slot)||slot<0||slot>=RULES.bench||p.bench.some(m=>m.slot===slot)))return false;
    const m=createMon(p.hand.splice(index,1)[0],p);if(slot===null)p.active=m;else putBench(p,m,slot);render();return true;}
  function dropAction(source,node,actions){if(!node)return null;
    const own=node.dataset.owner==='0';
    if(targetChoice?.handAction){const option=targetChoice.options.find(o=>o.value===source.i&&o.cardId===source.id);if(source.kind!=='card'||!option)return null;
      if(targetChoice.handAction==='candy'){const uid=Number(node.dataset.uid);return own&&option.targets.includes(uid)?{type:'handChoiceDrop',value:option.value,uid}:null;}
      return node.dataset.handReturn==='true'?{type:'handChoiceDrop',value:option.value}:null;}
    if(targetChoice?.setup){if(source.kind==='mon'&&node.dataset.setupReturn==='true')return {type:'setupUndoDrop',uid:source.uid};if(source.kind!=='card'||!own||card(source.id).stage!=='基础'||node.dataset.uid)return null;const p=game.players[0],slot=node.dataset.battleSlot==='true'?null:Number(node.dataset.slot);if(slot===null&&!p.active||Number.isInteger(slot)&&slot>=0&&slot<RULES.bench&&!p.bench.some(m=>m.slot===slot))return {type:'setupDrop',i:source.i,slot};return null;}
    if(source.kind==='extra')return own&&targetChoice?.allocation&&targetChoice.options.some(o=>o.value===Number(node.dataset.uid))?{type:'extraDrop',index:source.index,uid:Number(node.dataset.uid)}:null;
    if(source.kind==='mon'){if(!own||node.dataset.battleSlot!=='true')return null;
      if(targetChoice&&/出战|交换|接替/.test(targetChoice.title)&&targetChoice.options.some(o=>o.value===source.uid))return {type:'choiceDrop',uid:source.uid};
      return actions.find(a=>a.type==='retreat'&&a.uid===source.uid)||null;}
    if(source.kind==='energy')return own?actions.find(a=>a.type==='attach'&&a.uid===Number(node.dataset.uid)):null;
    const options=actions.filter(a=>a.i===source.i);
    if(source.category!=='精灵'){const action=options.find(a=>a.type==='trainer');if(!action||!node.closest('#battleTable'))return null;
      if(source.category==='道具'){const m=own&&node.dataset.uid?byUid(game.players[0],Number(node.dataset.uid)):null;return m&&!m.tool?{...action,targetUid:m.uid}:null;}
      const n=num(source.id);if([34,38,42,32].includes(n)&&node.dataset.uid){const owner=n===32?1:0,m=byUid(game.players[owner],Number(node.dataset.uid));
        if(node.dataset.owner!==String(owner)||!m||n===38&&info(m).attribute!=='草'||!(m.damage>0||n===34&&m.status.length)||n===32&&!game.players[1].bench.includes(m))return null;
        return {...action,targetUid:m.uid};}return action;}
    if(!own)return null;
    const basic=options.find(a=>a.type==='basic');
    if(basic&&node.dataset.slot!==undefined)return {...basic,slot:Number(node.dataset.slot)};
    return options.find(a=>a.type==='evolve'&&a.uid===Number(node.dataset.uid));}
  function wireDrag(node,source){node.style.touchAction='none';node.addEventListener('dragstart',e=>e.preventDefault());node.addEventListener('pointerdown',e=>{
    const choosing=source.kind==='mon'&&targetChoice?.setup||source.kind==='card'&&targetChoice?.handAction&&targetChoice.options.some(o=>o.value===source.i&&o.cardId===source.id)||targetChoice?.setup&&source.kind==='card'&&card(source.id).stage==='基础'||source.kind==='extra'&&targetChoice?.allocation||source.kind==='mon'&&targetChoice&&/出战|交换|接替/.test(targetChoice.title)&&targetChoice.options.some(o=>o.value===source.uid);
    if(e.button!==0||scene||game.winner||(!choosing&&(busy||targetChoice||game.current!==0||game.phase!=='play')))return;
    const actions=legalActions(0);if(!choosing&&!actions.some(a=>source.kind==='energy'?a.type==='attach':source.kind==='mon'?a.type==='retreat'&&a.uid===source.uid:a.i===source.i))return;
    drag={...source,pointer:e.pointerId,x:e.clientX,y:e.clientY,node,started:false};
  });node.addEventListener('click',e=>{if(Date.now()<suppressClickUntil){e.preventDefault();e.stopImmediatePropagation();}},true);}
  document.addEventListener('pointermove',e=>{if(!drag||drag.pointer!==e.pointerId)return;
    if(!drag.started&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<7)return;
    if(!drag.started){drag.started=true;const ghost=(drag.kind==='energy'?drag.node.querySelector('.energy-current .energy-chip'):drag.node).cloneNode(true);ghost.classList.add('drag-ghost');if(drag.kind==='energy'){ghost.classList.add('energy-drag-ghost');ghost.style.width='46px';ghost.style.height='46px';ghost.style.borderRadius='50%';ghost.style.overflow='hidden';}ghost.removeAttribute('id');
      ghost.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));document.body.append(ghost);drag.ghost=ghost;
      if(drag.kind==='energy'||drag.kind==='extra'||drag.kind==='card'&&drag.category==='精灵')arena.querySelector('#battleTable')?.classList.add('drag-dimming');
      const actions=legalActions(0);arena.querySelectorAll('[data-owner],[data-hand-return],[data-setup-return],#battleTable').forEach(n=>{if(dropAction(drag,n,actions))n.classList.add('drop-legal');});}
    e.preventDefault();drag.ghost.style.left=e.clientX+'px';drag.ghost.style.top=e.clientY+'px';
    arena.querySelectorAll('.drop-hover').forEach(n=>n.classList.remove('drop-hover'));
    const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-owner],[data-hand-return],[data-setup-return],#battleTable');
    if(dropAction(drag,target,legalActions(0)))target.classList.add('drop-hover');
  },{passive:false});
  document.addEventListener('pointerup',e=>{if(!drag||drag.pointer!==e.pointerId)return;
    if(!drag.started){clearDrag();return;}suppressClickUntil=Date.now()+400;
    const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-owner],[data-hand-return],[data-setup-return],#battleTable');
    const source=drag,action=dropAction(source,target,legalActions(0));clearDrag();
    if(action?.type==='setupUndoDrop'){if(networkHooks?.role==='client'){networkHooks.send('setupUndo',{uid:action.uid});return;}const p=game.players[0],m=byUid(p,action.uid);if(m){if(p.active===m)p.active=null;else p.bench.splice(p.bench.indexOf(m),1);p.hand.push(m.id);render();}return;}
    if(action?.type==='setupDrop'){placeSetup(action.i,action.slot);return;}
    if(action?.type==='extraDrop'){allocateToken(action.index,action.uid);return;}
    if(action?.type==='choiceDrop'){finishChoice(action.uid);return;}
    if(action?.type==='handChoiceDrop'){queuedHandDrop=action.uid??null;finishChoice(action.value);return;}
    if(action&&!busy&&!targetChoice&&!scene&&(source.kind==='energy'||source.kind==='mon'||game.players[0].hand[source.i]===source.id))humanAction(action);
  });document.addEventListener('pointercancel',clearDrag);
  window.addEventListener('blur',clearDrag);
  function chooseTarget(value){if(targetChoice?.allocation){if(targetChoice.picked>=0)allocateToken(targetChoice.picked,value);return;}selectedTarget=value;render();}
  function decorateTarget(node,value){if(targetChoice?.setup)return false;if(!targetChoice||!targetChoice.options.every(o=>o.kind==='mon'||o.kind==='slot'))return false;
    const possible=targetChoice.options.some(o=>o.value===value);node.classList.add(possible?'targetable':'target-muted');
    if(possible){if(selectedTarget===value)node.classList.add('target-selected');node.onclick=()=>chooseTarget(value);}
    return true;}
  function renderMon(owner,m,active){const p=game.players[owner],box=el('button',undefined,'table-card'+(active?' active':''));
    box.type='button';box.dataset.owner=String(owner);box.dataset.uid=String(m.uid);box.dataset.anchor='card-'+m.uid;if(active)box.dataset.battleSlot='true';
    const concealed=!!m.concealed||owner===1&&game.phase==='setup'&&!game.revealed&&!m.setupShown;
    const c=concealed?null:info(m);
    box.setAttribute('aria-label',concealed?'对方已布阵精灵':`${p.label}的${c.name}，剩余HP ${Math.max(0,c.hp-m.damage)}，点击查看`);
    if(concealed){box.classList.add('setup-concealed');box.append(cardBack('concealed-'+m.uid,owner),el('span','等待揭示','card-name'));box.disabled=true;return box;}
    box.append(artwork(c,'mon-'+m.uid),el('span',c.name,'card-name'));
    const hp=el('div',String(Math.max(0,c.hp-m.damage)),'hp-badge'),bar=el('div',undefined,'hp-bar'),fill=el('span');
    if((c.hp-m.damage)/c.hp<.3)hp.classList.add('critical');else if((c.hp-m.damage)/c.hp<.6)hp.classList.add('low');fill.style.width=Math.max(0,(c.hp-m.damage)/c.hp*100)+'%';if((c.hp-m.damage)/c.hp<.3)fill.style.background='#e79a82';bar.append(fill);hp.append(bar);box.append(hp);
    const energy=el('div',undefined,'energy-chips');m.energy.forEach((t,index)=>{if(scene?.type==='attachFlight'&&scene.target===m.uid&&index>=m.energy.length-scene.added)return;if(owner===0&&targetChoice?.movement&&targetChoice.items.some((item,i)=>item.source===m.uid&&item.index===index&&targetChoice.tokens[i]!==null))return;energy.append(energyChip(t));});if(m.energy.length>4){energy.classList.add('energy-stack');energy.style.setProperty('--energy-overlap',Math.min(16,7+(m.energy.length-5)*1.5)+'px');}if(owner===0&&targetChoice?.allocation)targetChoice.tokens.forEach((uid,i)=>{if(uid!==m.uid)return;const chip=energyChip(targetChoice.items?.[i].type||targetChoice.type);chip.classList.add('pending-energy');energy.append(chip);});box.append(energy);box.title=energySummary(p,m);box.append(el('span','能量 '+m.energy.length,'energy-count'));
    if(owner===0&&active&&game.current===0&&game.phase==='play'&&!game.winner&&!busy&&!scene&&!targetChoice)box.classList.add('attack-ready');
    if(c.ability)box.append(el('span',c.ability,'ability-tag'));if(m.tool){const tool=el('span',card(m.tool).name,'attached-tool-badge');tool.title='附着道具：'+card(m.tool).effect;box.append(tool);}
    if(owner===0&&targetChoice?.movement&&targetChoice.items.some(item=>item.source===m.uid)){box.append(el('span',energySourceLabel(m),'energy-donor-badge'));if(targetChoice.items[targetChoice.picked]?.source===m.uid)box.classList.add('energy-source-selected');}
    const conditions=el('div',undefined,'special-status-icons');for(const type of m.status){const spec=SPECIAL_STATUS[type];if(!spec)continue;const badge=el('span',spec.icon,'special-status-icon');badge.title=type;badge.setAttribute('aria-label',type);badge.style.setProperty('--status-color',spec.color);conditions.append(badge);}box.append(conditions);box.onclick=()=>inspectCard(c,owner,m);
    decorateTarget(box,m.uid);if(owner===0&&(!active||targetChoice?.setup))wireDrag(box,{kind:'mon',uid:m.uid});
    if(scene?.target===m.uid){box.classList.add(scene.type==='damage'?'hit-card':scene.type==='ko'?'ko-card':'glow-card');
      if(scene.statusType){box.classList.add('status-checking');box.style.setProperty('--status-color',SPECIAL_STATUS[scene.statusType].color);const pulse=el('span',SPECIAL_STATUS[scene.statusType].icon,'status-check-pulse');box.append(pulse);}
      if(scene.type==='statusRecover'){box.classList.add('status-recovered');}
      if(scene.type==='heal'){const fx=el('span',undefined,'healing-fx');fx.append(el('i',undefined,'heal-ring'));for(let i=0;i<8;i++){const particle=el('i','✦','heal-particle');particle.style.setProperty('--i',i);fx.append(particle);}box.append(fx);}
      if(scene.amount){const number=el('span',scene.type==='damage'?String(scene.amount).replace(/^[−-]/,''):scene.amount,'damage-float'+(scene.type==='heal'?' heal':''));number.setAttribute('aria-label',scene.type==='damage'?'受到'+number.textContent+'点伤害':'回复'+number.textContent+'HP');box.append(number);if(scene.type==='damage')box.append(el('span',undefined,'damage-impact-flare'));}}
    return box;}
  function emptyCard(owner,slot){const b=el('button',slot===null?'战斗区':'备战 '+(slot+1),'table-card empty'+(slot===null?' active':''));b.type='button';
    b.setAttribute('aria-label',(owner===0?'自己的':'对方的')+'空'+(slot===null?'战斗区':'备战位置'+(slot+1)));
    b.dataset.owner=String(owner);if(slot===null)b.dataset.battleSlot='true';if(slot!==null)b.dataset.slot=String(slot);
    decorateTarget(b,owner===0?'slot-'+slot:'foe-slot-'+slot);if(owner===0&&slot===null&&targetChoice&&/出战|交换|接替/.test(targetChoice.title))b.classList.remove('target-muted');return b;}
  async function requestTargets(title,actions){if(busy||!actions.length)return;busy=true;render();let picked=null;
    try{const p=game.players[0],options=actions.map(a=>{const m=byUid(p,a.uid);return {...monOptions(p,[m])[0],action:a};});
      const uid=await choose(0,title,options,true);picked=actions.find(a=>a.uid===uid);
    }finally{busy=false;render();}if(picked)await humanAction(picked);}
  function inspectCard(c,owner=0,m=null,handIndex=null,viewOnly=false){if(!game)return;
    const p=game.players[owner],q=game.players[1-owner],actions=legalActions(0),enabled=!busy&&!scene&&!targetChoice&&game.current===0&&game.phase==='play'&&!game.winner;
    const attacking=!viewOnly&&m&&owner===0&&p.active===m&&enabled;
    const benchAbility=!viewOnly&&m&&owner===0&&p.active!==m&&enabled&&ACTIVE_ABILITIES.includes(c.ability);
    if(!attacking&&!benchAbility){
      inspector.className='raw-card-dialog';inspector.replaceChildren();
      const image=el('div',undefined,'raw-card-art');image.append(artwork(c,'inspect-raw'));inspector.append(image);
      inspector.setAttribute('aria-label','查看'+c.name+'，点击任意位置返回');inspector.onclick=()=>inspector.close();
      inspector.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();inspector.close();}};
      inspector.showModal();return;
    }
    inspector.onkeydown=null;
    inspector.className=(attacking||benchAbility)?'card-zoom-dialog attack-dialog':'card-zoom-dialog';
    const palette={'光':['#efcb5b','#b6952b'],'草':['#79ba4b','#428630'],'火':['#ffad3d','#ec8824'],'水':['#56b7e3','#287fac'],'斗':['#d88c60','#ad613a'],'钢':['#9dacba','#637b8f'],'机械':['#9dacba','#637b8f'],'幻':['#c482d8','#9255ae'],'超':['#c482d8','#9255ae'],'恶':['#8c7997','#594965'],'龙':['#737cca','#47569d'],'普':['#baa68d','#887761'],'电':['#f2d55a','#c3a324']};const colors=palette[c.attribute]||palette['普'];inspector.style.setProperty('--skill-top',colors[0]);inspector.style.setProperty('--skill-bottom',colors[1]);
    inspector.replaceChildren();const top=el('div',undefined,'inspect-close');top.append(el('h2',c.name),actionButton('返回桌面',()=>inspector.close()));
    const frame=el('div',undefined,'zoom-frame'),art=el('div',undefined,'zoom-card');art.append(artwork(c,'inspect'));frame.append(art);
    const buttons=el('div',undefined,'zoom-controls');
    const run=fn=>()=>{inspector.close();fn();};
    if(m?.tool)buttons.append(actionButton('查看道具 · '+card(m.tool).name,()=>{inspector.close();inspectCard(card(m.tool),owner);}));
    const zoom=()=>{frame.classList.toggle('zoomed');};
    inspector.onclick=e=>{if(inspector.classList.contains('card-zoom-dialog')&&!e.target.closest('button')&&!e.target.closest('.on-card-skill'))inspector.close();};
    if(attacking||benchAbility){const overlay=el('div',undefined,'card-skill-overlay');overlay.style.top=(c.skills.length===1?'57%':'53%');
      if(attacking)for(const name of c.skills){const definition=SKILLS[name],a=actions.find(x=>x.type==='attack'&&x.name===name),n=q.active?damageFor(p,q,m,name):definition[1];
        const skill=actionButton('',run(()=>humanAction(a)),!a);skill.className='on-card-skill';skill.dataset.skill=name;
        const cost=el('span',undefined,'skill-cost');costFor(p,m,name).forEach(t=>cost.append(energyChip(t)));
        const damage=el('strong',String(n),'skill-damage'+(n>definition[1]?' increased':n<definition[1]?' decreased':''));
        skill.append(cost,el('strong',name,'on-card-name'),damage);skill.title=(CARD_SKILL_DEFINITIONS[name]?.[2]||'无额外效果')+(a?'；点击发动':'；当前不可发动');
        skill.setAttribute('aria-label',name+'，'+n+'伤害'+(!a?'，能量不足':''));overlay.append(skill);}
      if(c.ability){const ability=actions.find(a=>a.type==='ability'&&a.uid===m.uid),entry=actionButton('',ability?run(()=>humanAction(ability)):()=>{},!ability);entry.className='on-card-skill on-card-ability';entry.title=CARD_ABILITY_DEFINITIONS[c.ability]||'';const cost=el('span',undefined,'skill-cost');cost.append(el('span','特性','ability-marker'));entry.append(cost,el('strong',c.ability,'on-card-name'),el('span',ACTIVE_ABILITIES.includes(c.ability)?'每回合一次':'自动生效','ability-mode'));entry.setAttribute('aria-label','特性 '+c.ability+(ability?'，可发动':'，'+(ACTIVE_ABILITIES.includes(c.ability)?'当前不可发动':'自动生效')));overlay.prepend(entry);}
      if(attacking){const retreats=actions.filter(a=>a.type==='retreat'),retreat=actionButton('',run(()=>requestTargets('选择撤退后出战的精灵',retreats)),!retreats.length);retreat.className='on-card-retreat';
      const retreatCost=el('span',undefined,'skill-cost');for(let i=0;i<Math.max(0,c.retreat-(p.wind||0));i++)retreatCost.append(energyChip('无'));retreat.append(retreatCost,el('strong','撤退'));overlay.append(retreat);}art.append(overlay);
      buttons.append(actionButton('查看原卡图',run(()=>inspectCard(c,owner,m,handIndex,true))));
    }else {art.tabIndex=0;art.setAttribute('role','button');art.setAttribute('aria-label','点击关闭'+c.name+'卡图');art.onclick=()=>inspector.close();
      art.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();zoom();}};
      
      if(viewOnly&&m&&owner===0&&p.active===m&&enabled)buttons.append(actionButton('选择技能',run(()=>inspectCard(c,owner,m))));
    }
    if(targetChoice?.setup&&owner===0&&m)buttons.append(actionButton('撤回布置',run(()=>{if(networkHooks?.role==='client'){networkHooks.send('setupUndo',{uid:m.uid});return;}const p=game.players[0];if(p.active===m)p.active=null;else p.bench.splice(p.bench.indexOf(m),1);p.hand.push(m.id);render();})));
    if(!viewOnly&&owner===0&&enabled){
      if(m){const attach=actions.find(a=>a.type==='attach'&&a.uid===m.uid);
        if(attach)buttons.append(actionButton('附能',run(()=>humanAction(attach))));
        if(ACTIVE_ABILITIES.includes(c.ability)&&!attacking&&!benchAbility){const ability=actions.find(a=>a.type==='ability'&&a.uid===m.uid);buttons.append(actionButton('使用'+c.ability,run(()=>humanAction(ability)),!ability));}
        if(p.active===m&&!attacking){const retreats=actions.filter(a=>a.type==='retreat');buttons.append(actionButton('撤退',run(()=>requestTargets('选择撤退后出战的精灵',retreats)),!retreats.length));}
      }
      if(handIndex!==null){const basic=actions.find(a=>a.type==='basic'&&a.i===handIndex),evos=actions.filter(a=>a.type==='evolve'&&a.i===handIndex),trainer=actions.find(a=>a.type==='trainer'&&a.i===handIndex);
        if(c.category!=='精灵')buttons.append(actionButton('使用',run(()=>humanAction(trainer)),!trainer));
        else if(c.stage==='基础')buttons.append(actionButton('放入备战区',run(()=>humanAction(basic)),!basic));
        else buttons.append(actionButton('进化',run(()=>requestTargets('选择进化为'+c.name+'的精灵',evos)),!evos.length));
      }
    }
    const description=el('div',undefined,'inspect-description');if(c.category==='精灵'){if(c.ability)description.append(el('p',c.ability+'：'+CARD_ABILITY_DEFINITIONS[c.ability]));for(const name of c.skills){const d=CARD_SKILL_DEFINITIONS[name];description.append(el('p',name+' · '+(d[0]||'零能量')+' · '+d[1]+'伤害'+(d[2]?'：'+d[2]:'')));}}else description.append(el('p',c.effect));inspector.append(top,frame,buttons,description);inspector.showModal();}
  let heartSerial=0;
  const HEART_PATH='M16 27.5C13.7 25.5 2.2 18.3 2.2 10.2C2.2 5.8 5.3 2.8 9.4 2.8C12.4 2.8 14.6 4.3 16 6.8C17.4 4.3 19.6 2.8 22.6 2.8C26.7 2.8 29.8 5.8 29.8 10.2C29.8 18.3 18.3 25.5 16 27.5Z';
  function glassHeartSvg(owner,empty=false,cls='',clip=''){
    const id='magic-glass-'+(++heartSerial),colors=owner===0?['#d6fff0','#52dca6','#168653']:['#f3e4ff','#b483ef','#7040ae'];
    const shape=empty?'<path class="heart-outline" d="'+HEART_PATH+'" fill="none" stroke="currentColor" stroke-width="1.25"/>':'<path d="'+HEART_PATH+'" fill="url(#'+id+')" stroke="'+colors[2]+'" stroke-width=".65"/><path class="heart-glint" d="M5.7 10.1C5.7 7.4 7.2 5.8 9.5 5.8C10.7 5.8 11.5 6.2 12.2 6.9" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="1.7" stroke-linecap="round"/><path class="heart-glint" d="M19.5 6.5C21.5 4.8 24.8 5.4 26 7.6" fill="none" stroke="#fff" stroke-opacity=".42" stroke-width="1.1" stroke-linecap="round"/>';
    return '<svg class="'+cls+'" viewBox="0 0 32 30" aria-hidden="true"><defs><linearGradient id="'+id+'" x1=".25" y1="0" x2=".75" y2="1" gradientUnits="objectBoundingBox"><stop stop-color="'+colors[0]+'"/><stop offset=".42" stop-color="'+colors[1]+'"/><stop offset="1" stop-color="'+colors[2]+'"/></linearGradient>'+clip+'</defs>'+shape+'</svg>';
  }
  function magicLabel(p){const x=el('span',undefined,'magic-dots '+(p===game.players[0]?'magic-player':'magic-opponent'));x.setAttribute('aria-label',p.label+'剩余魔力'+p.magic);
    for(let i=0;i<RULES.magic;i++){const heart=el('span',undefined,'magic-heart'+(i>=p.magic?' empty':''));
      heart.innerHTML=glassHeartSvg(p===game.players[0]?0:1,i>=p.magic);
      if(scene?.type==='magic'&&game.players[scene.owner]===p&&i>=p.magic&&i<p.magic+scene.loss)heart.classList.add('lost');
      heart.title=i<p.magic?'剩余魔力':'已失去魔力';x.append(heart);}
    x.setAttribute('aria-label',p.label+'剩余'+p.magic+'点魔力');return x;}
  function inspectDiscard(owner){if(!game)return;const p=game.players[owner];inspector.className='';inspector.onclick=null;inspector.replaceChildren();
    const top=el('div',undefined,'inspect-close');top.append(el('h2',p.label+'的弃牌区'),actionButton('返回桌面',()=>inspector.close()));inspector.append(top);
    const grid=el('div',undefined,'choice-grid');for(const [discardIndex,id] of p.discard.entries()){const c=card(id),wrap=el('div',undefined,'discard-entry'),b=actionButton('',()=>{inspector.close();inspectCard(c,owner);});
      b.className='choice-card discard-card';b.setAttribute('aria-label','查看'+c.name+'详情');b.append(artwork(c,'discard-'+owner+'-'+discardIndex),el('span',c.name));wrap.append(b);
      const revive=owner===0&&legalActions(0).find(a=>a.type==='revive'&&a.i===discardIndex);if(revive)wrap.append(actionButton('发动不朽：复活',()=>{inspector.close();humanAction(revive);}));grid.append(wrap);}
    const energies=el('div',undefined,'discard-energy-images');energies.setAttribute('aria-label','弃置能量');if(p.discardEnergy.length){for(const t of p.discardEnergy)energies.append(energyChip(t));}else energies.append(el('span','暂无弃置能量','muted'));inspector.append(energies,grid);inspector.showModal();}
  function cardBack(key,owner=0){const cacheKey=owner+'-'+sleeveId(game?.players[owner]?.sleeve)+'-'+key;if(backNodes.has(cacheKey))return backNodes.get(cacheKey);const host=el('div',undefined,'table-art card-back-art'),selected=SLEEVES.find(x=>x.id===sleeveId(game?.players[owner]?.sleeve));host.dataset.sleeve=selected.id;host.dataset.sleeveOwner=String(owner);host.setAttribute('aria-label','卡牌背面 · '+selected.name);
    if(selected.id==='default')loadImage('card-back',host);else {host.classList.add('custom-card-sleeve');const img=el('img');img.src='./'+encodeURIComponent(IMAGE_FOLDER)+'/'+encodeURIComponent(selected.file);img.alt=selected.name;img.onerror=()=>{host.dataset.sleeveFallback='default';loadImage('card-back',host);};host.append(img);}backNodes.set(cacheKey,host);return host;}

  function resourceRail(owner){const p=game.players[owner],rail=el('div',undefined,'resource-rail '+(owner===0?'rail-human':'rail-foe'));
    const piles=el('div',undefined,'resource-piles');
    const pile=el('div',undefined,'pile deck-pile');if(scene?.type==='shuffle'&&(scene.owner??game.current)===owner)pile.classList.add('deck-shuffling');pile.title=p.label+'牌库：'+p.deck.length+'张';pile.dataset.anchor='deck-'+owner;if(owner===0){pile.dataset.handReturn='true';if(targetChoice?.handAction==='box')pile.classList.add('drop-legal');}
    if(p.deck.length)pile.append(cardBack('deck-'+owner,owner));else {pile.classList.add('deck-empty');pile.append(el('div','已抽空','discard-empty'));}
    pile.setAttribute('aria-label',p.label+'牌库，'+p.deck.length+'张');pile.append(el('span',String(p.deck.length),'pile-quantity'));piles.append(pile);
    const discard=actionButton('',()=>inspectDiscard(owner));discard.className='pile discard';discard.dataset.anchor='discard-'+owner;
    discard.setAttribute('aria-label',p.label+'的弃牌区，'+p.discard.length+'张，点击查看');
    if(p.discard.length)discard.append(artwork(card(p.discard[p.discard.length-1]),'discard-top-'+owner));
    else discard.append(el('div','弃牌区','discard-empty'));
    discard.append(el('span',String(p.discard.length),'pile-quantity'));piles.append(discard);rail.append(piles);
    const effect=p.effectEnergies?.[0],state=effect?'effect':game.phase==='setup'?'setup':p.attached?'used':!p.nextEnergy?'empty':game.current!==owner?'waiting':'ready';
    const status={setup:'待开局',used:'已附能',empty:'无常规能量',waiting:'等待回合',ready:'可附能'}[state];
    const zone=el('button',undefined,'zone-energy energy-'+state);zone.type='button';zone.dataset.anchor='energy-'+owner;zone.dataset.energyState=state;
    zone.title=p.label+'：'+(effect?'效果产生的'+effect+'能量':status)+'；本回合能量：'+(p.nextEnergy||'无')+'；下回合：'+p.forecast;zone.setAttribute('aria-label',zone.title);
    const current=el('span',undefined,'energy-current'),pedestal=el('span',undefined,'energy-pedestal');pedestal.setAttribute('aria-hidden','true');current.append(pedestal);
    if(effect){if(scene?.type!=='attachFlight')current.append(energyChip(effect));if(p.effectEnergies.length>1)current.append(el('small','×'+p.effectEnergies.length,'effect-energy-count'));}else if(state==='used'||p.energyPending){}else if(p.nextEnergy)current.append(energyChip(p.nextEnergy));else {}
    zone.append(current);
    zone.onclick=()=>owner===0&&requestTargets('选择附加'+p.nextEnergy+'能量的精灵',legalActions(0).filter(a=>a.type==='attach'));
    if(owner===0)wireDrag(zone,{kind:'energy'});
    zone.disabled=owner===1||busy||state!=='ready'||!!game.winner;const next=el('span',undefined,'resource-label energy-next');next.title='下回合能量';next.setAttribute('aria-label','下回合能量：'+(p.energyPending?p.nextEnergy:p.forecast));next.append(energyChip(p.energyPending?p.nextEnergy:p.forecast));zone.append(next);rail.append(zone);return rail;}
  function renderScene(board){if(!scene||['drawFlight','openingDeal','evolveFlight','setupBenchFlight','energyReady','attachFlight','forcedSwitchFlight','attackWindup','energyDiscardFlight','win'].includes(scene.type))return;if(['opening','ready','reveal','end','effect','damage','heal','energy','place','switch','ko','koTransfer','attackFx','discard','statusRecover'].includes(scene.type))return;const layer=el('div',undefined,'scene-layer'),content=el('div',undefined,'scene-content');
    if(scene.type==='magic'){const p=game.players[scene.owner];content.classList.add('magic-showcase',scene.owner===0?'magic-player':'magic-opponent');
      const row=el('div',undefined,'broken-hearts'),path='M16 27.5C13.7 25.5 2.2 18.3 2.2 10.2C2.2 5.8 5.3 2.8 9.4 2.8C12.4 2.8 14.6 4.3 16 6.8C17.4 4.3 19.6 2.8 22.6 2.8C26.7 2.8 29.8 5.8 29.8 10.2C29.8 18.3 18.3 25.5 16 27.5Z';
      for(let i=0;i<3;i++){const heart=el('div',undefined,'shatter-heart'),lost=i>=p.magic,newLoss=lost&&i<p.magic+scene.loss,key='break-'+generation+'-'+scene.owner+'-'+i;
        heart.innerHTML=glassHeartSvg(scene.owner,lost,'heart-base '+(lost?'outline':'intact'));
        if(newLoss)heart.innerHTML+=['left','right'].map(side=>{const clip='<clipPath id="'+key+'-'+side+'"><polygon points="'+(side==='left'?'0,0 18,0 14,8 18,13 14,19 16,30 0,30':'18,0 32,0 32,30 16,30 14,19 18,13 14,8')+'"/></clipPath>';return glassHeartSvg(scene.owner,false,'heart-piece piece-'+side,clip).replace('</defs>','</defs><g clip-path="url(#'+key+'-'+side+')">').replace('</svg>','</g></svg>');}).join('');row.append(heart);}
      content.append(row);content.setAttribute('role','status');content.setAttribute('aria-label',p.label+'剩余'+p.magic+'点魔力');layer.append(content);board.append(layer);return;}
    if(scene.type==='turn'){content.classList.add('turn-banner',game.current===0?'banner-player':'banner-opponent');layer.classList.add('turn-banner-layer');}
    if(['card','attack','evolve','ability'].includes(scene.type)&&scene.cardId){const c=card(scene.cardId),art=el('div',undefined,'scene-card');art.append(artwork(c,'scene'));content.append(art);}
    if(scene.type==='draw'){const art=el('div',undefined,'scene-card');if(scene.cardId)art.append(artwork(card(scene.cardId),'draw'));else art.append(cardBack('draw',scene.owner??game.current));content.append(art);}
    if(scene.type==='shuffle')return;
    if(scene.type==='coin')content.append(coinView());
    if(['turn','end','opening','reveal','magic','win','ready'].includes(scene.type))content.classList.add('scene-turn');
    if(scene.type==='turn')content.append(el('h2',scene.title));content.setAttribute('aria-label',scene.title);
    // 伤害与治疗的数字显示在对应卡牌上，避免中央提示遮住目标。
    if(['damage','heal','energy','place','switch','ko','koTransfer','attackFx','discard'].includes(scene.type)){
      layer.style.alignItems='flex-start';content.style.marginTop='8px';content.classList.add('scene-turn');}
    layer.append(content);board.append(layer);
  }
  function fitBattle(){if(!window.requestAnimationFrame)return;const mat=arena.querySelector('.battle-mat'),viewport=arena.querySelector('.mat-viewport');if(!mat||!viewport)return;
    const scale=Math.min(1,viewport.clientWidth/mat.offsetWidth,viewport.clientHeight/mat.offsetHeight);
    mat.style.transform='translateX(-50%) scale('+scale+')';mat.dataset.scale=String(scale);const dock=mat.querySelector('.action-dock'),board=mat.querySelector('#battleTable');if(dock&&board)dock.style.top=(board.offsetTop+board.offsetHeight/2-dock.offsetHeight/2)+'px';
    if(board){const edge=board.getBoundingClientRect(),page=arena.getBoundingClientRect();arena.querySelectorAll('.extra-energy-rack,.selection-prompt').forEach(panel=>{const width=panel.offsetWidth;let left=edge.right-page.left+6;if(left+width>page.width-6)left=edge.right-page.left-width-6;panel.style.right='auto';panel.style.left=Math.max(6,left)+'px';panel.style.top=(edge.top-page.top+edge.height*.55)+'px';});}}

  window.addEventListener('resize',()=>{if(window.requestAnimationFrame)window.requestAnimationFrame(fitBattle);});
  function render(){if(!game||networkHooks?.role==='server')return;
    const previous=new Map();arena.querySelectorAll('[data-uid]').forEach(n=>previous.set(n.dataset.uid,n.getBoundingClientRect()));
    const previousBackdrop=arena.querySelector('.turn-backdrop:not(.previous-turn-backdrop)')?.cloneNode(true);
    const oldLog=arena.querySelector('.battle-log-wrap'),logOpen=oldLog?.open||false;
    const existingAmbient=arena.querySelector('.battle-ambient');arena.replaceChildren();const ambient=existingAmbient||el('div',undefined,'battle-ambient');ambient.setAttribute('aria-hidden','true');if(!existingAmbient){ambient.append(el('i',undefined,'ambient-seal ambient-seal-left'),el('i',undefined,'ambient-seal ambient-seal-right'));for(let i=0;i<12;i++){const spark=el('i',undefined,'ambient-spark');spark.style.setProperty('--x',(i<6?4+i*3:81+(i-6)*3)+'%');spark.style.setProperty('--y',(12+(i*19)%78)+'%');spark.style.setProperty('--delay',(-i*.7)+'s');ambient.append(spark);}}arena.append(ambient);const header=el('div',undefined,'header');header.append(el('h1','对战测试'));
    const top=el('div',undefined,'battle-top-actions'),select=el('select');select.setAttribute('aria-label','播放速度');
    for(const [v,label] of [[1.5,'慢速'],[1,'标准速度'],[.55,'快速']]){const o=el('option',label);o.value=String(v);select.append(o);}select.value=String(speed);select.onchange=()=>{speed=Number(select.value);};
    top.append(select,actionButton('返回选卡',()=>{if(networkHooks?.role==='client'){networkHooks.leave();return;}if(!game.winner&&!confirm('结束当前对局并返回选卡？'))return;
      generation++;if(aiTimer!==null)clearTimeout(aiTimer);aiTimer=null;game=null;scene=null;targetChoice=null;showPage('battleSetup');},busy||game.phase==='setup'));
    header.append(top);arena.append(header);
    if(targetChoice?.handAction){const prompt=el('div',undefined,'selection-prompt hand-selection-prompt');prompt.append(el('strong',targetChoice.handAction==='candy'?'拖动发光的二阶精灵到对应基础精灵上':'拖动发光的精灵到自己的牌库'));if(targetChoice.optional)prompt.append(actionButton('取消',()=>{queuedHandDrop=null;finishChoice(null);}));arena.append(prompt);}
    if(targetChoice&&!targetChoice.setup&&!targetChoice.allocation&&targetChoice.options.every(o=>o.kind==='mon'||o.kind==='slot')){
      const prompt=el('div',undefined,'selection-prompt'),chosen=targetChoice.options.find(o=>o.value===selectedTarget);
      prompt.setAttribute('aria-label',targetChoice.title);prompt.setAttribute('role','group');
      const controls=el('div',undefined,'dock-buttons');controls.append(actionButton('确认选择',()=>finishChoice(selectedTarget),selectedTarget===null));
      if(targetChoice.optional)controls.append(actionButton('取消 / 跳过',()=>finishChoice(null)));prompt.append(controls);arena.append(prompt);}
    if(targetChoice?.allocation){const choice=targetChoice,rack=el('div',undefined,'extra-energy-rack'),sourceGroups=new Map();rack.setAttribute('aria-label',choice.title);
      choice.tokens.forEach((uid,index)=>{const token=el('button',undefined,'extra-energy-token'+(uid!==null?' assigned':'')+(choice.picked===index?' picked':''));token.type='button';token.dataset.extraIndex=String(index);const type=choice.items?.[index].type||choice.type;token.append(energyChip(type));
        token.setAttribute('aria-label',type+'能量 '+(index+1)+(choice.movement?'，来自'+energySourceLabel(byUid(game.players[0],choice.items[index].source))+'的'+info(byUid(game.players[0],choice.items[index].source)).name:''));if(uid!==null)token.append(el('small',info(byUid(game.players[0],uid)).name));
        token.onclick=()=>{choice.tokens[index]=null;choice.picked=index;render();};wireDrag(token,{kind:'extra',index});if(choice.movement){const source=byUid(game.players[0],choice.items[index].source);token.dataset.sourceUid=String(source.uid);token.onmouseenter=()=>highlightEnergySource(source.uid,true);token.onmouseleave=()=>highlightEnergySource(source.uid,false);
          if(!sourceGroups.has(source.uid)){const group=el('div',undefined,'energy-source-group');group.dataset.sourceUid=String(source.uid);const heading=el('div',undefined,'energy-source-heading'),thumb=el('button',undefined,'energy-source-thumb');thumb.type='button';thumb.append(artwork(info(source),'energy-donor-'+source.uid));thumb.setAttribute('aria-label','查看'+energySourceLabel(source)+'的'+info(source).name);thumb.onclick=()=>inspectCard(info(source),0,source,null,true);heading.append(thumb,el('span',energySourceLabel(source)+' · '+info(source).name));group.append(heading);const pool=el('div',undefined,'energy-source-pool');group.append(pool);group.onmouseenter=()=>highlightEnergySource(source.uid,true);group.onmouseleave=()=>highlightEnergySource(source.uid,false);sourceGroups.set(source.uid,pool);rack.append(group);}sourceGroups.get(source.uid).append(token);
        }else rack.append(token);});
      rack.append(actionButton('确定',()=>finishChoice(choice.tokens.slice()),!choice.optional&&choice.tokens.some(x=>x===null)));if(choice.optional)rack.append(actionButton('跳过',()=>finishChoice(null)));arena.append(rack);}

    const board=el('div',undefined,'battle-table');board.id='battleTable';
    const promotionChoice=targetChoice?.title==='选择接替出战的精灵'&&!targetChoice.setup;
    if(promotionChoice){board.classList.add('promotion-choice');const shade=el('div',undefined,'promotion-shade');shade.setAttribute('aria-hidden','true');board.append(shade);}
    const backgroundOwner=game.phase==='play'?game.current:null;board.dataset.background=backgroundId(game.players[backgroundOwner??0].background);board.dataset.backgroundOwner=backgroundOwner===null?'setup':String(backgroundOwner);
    const backdrop=el('div',undefined,'turn-backdrop'+(backgroundOwner===null?'':backgroundOwner===0?' backdrop-player':' backdrop-opponent'));backdrop.setAttribute('aria-hidden','true');const chosenBackground=BACKGROUNDS.find(b=>b.id===game.players[backgroundOwner??0].background);if(chosenBackground?.available){let img=backgroundNodes.get(chosenBackground.file);if(!img){img=el('img',undefined,'battle-background-image');img.src='./'+encodeURIComponent(IMAGE_FOLDER)+'/'+encodeURIComponent(chosenBackground.file);img.alt='';backgroundNodes.set(chosenBackground.file,img);}img.onload=()=>board.classList.add('background-loaded');img.onerror=()=>{board.classList.remove('background-loaded');board.dataset.backgroundError=chosenBackground.file;};if(img.complete&&img.naturalWidth)board.classList.add('background-loaded');backdrop.append(img);backdrop.classList.add('custom-background');}board.append(backdrop);
    const turnKey=generation+':'+game.phase+':'+backgroundOwner;
    if(paintedTurn!==turnKey){const previous=paintedTurn;paintedTurn=turnKey;backgroundWipe=previous&&backgroundOwner!==null&&speed>0&&previousBackdrop?{from:previousBackdrop,key:turnKey,start:performance.now(),duration:1000*speed}:null;}
    if(backgroundWipe?.key===turnKey){const elapsed=performance.now()-backgroundWipe.start,remaining=backgroundWipe.duration-elapsed;
      if(remaining>0){const old=backgroundWipe.from.cloneNode(true);old.classList.add('previous-turn-backdrop');old.style.maskImage='none';old.style.webkitMaskImage='none';board.insertBefore(old,backdrop);backdrop.classList.add('diagonal-background-wipe');const progress=-15+130*elapsed/backgroundWipe.duration;backdrop.style.setProperty('--battle-wipe',progress+'%');backdrop.animate([{'--battle-wipe':progress+'%'},{'--battle-wipe':'115%'}],{duration:remaining,easing:'linear',fill:'forwards'});}else backgroundWipe=null;}


    for(const owner of [1,0]){const p=game.players[owner],zone=el('div',undefined,'table-zone');
      const meta=el('div',undefined,'zone-meta');meta.append(el('span',p.label+' · 手牌 '+p.hand.length));
      const bench=el('div',undefined,'bench-row');for(let i=0;i<RULES.bench;i++){
        const m=p.bench.find(m=>m.slot===i) || p.bench.filter(m=>m.slot===undefined)[i];bench.append(m?renderMon(owner,m,false):emptyCard(owner,i));}
      const active=el('div',undefined,'active-row');active.append(p.active?renderMon(owner,p.active,true):emptyCard(owner,null));
      if(owner===1){meta.classList.add('foe-status');meta.replaceChildren(magicLabel(p));zone.append(meta);const backs=el('div',undefined,'hand-backs');for(let i=0;i<p.hand.length+(scene?.type==='openingDeal'?5:scene?.type==='drawFlight'&&scene.owner===1?1:0);i++){const back=el('span',undefined,'mini-back');back.append(cardBack('foe-hand-'+i,1));if(scene?.type==='drawFlight'&&scene.owner===1&&i===p.hand.length)back.classList.add('draw-destination');if(scene?.type==='openingDeal'){back.classList.add('draw-destination');back.dataset.dealOwner='1';}backs.append(back);}zone.append(backs,bench,active);}
      else {meta.classList.add('human-status');meta.replaceChildren(magicLabel(p));zone.append(meta,active,bench);}zone.dataset.ownerZone=String(owner);zone.append(resourceRail(owner));board.append(zone);
    }
    const viewport=el('div',undefined,'mat-viewport'),mat=el('div',undefined,'battle-mat');mat.append(board);viewport.append(mat);renderScene(board);arena.append(viewport);playBoardEffects(board);
    const actions=legalActions(0),hand=el('div',undefined,'hand-tray');if(targetChoice?.setup)hand.dataset.setupReturn='true';game.players[0].hand.forEach((id,i)=>{const c=card(id),handSelection=targetChoice?.handAction,eligibleHand=handSelection&&targetChoice.options.some(o=>o.value===i),playable=handSelection?eligibleHand:targetChoice?.setup?c.stage==='基础':actions.some(a=>a.i===i);
      const box=el('button',undefined,'hand-card'+(playable&&(!busy||targetChoice?.setup||handSelection)?' playable':'')+(handSelection?(eligibleHand?' hand-choice-eligible':' hand-choice-muted'):''));box.type='button';box.setAttribute('aria-label',c.name+'，点击查看与操作');
      box.append(artwork(c,'hand-'+i),el('span',c.name,'card-name'));box.onclick=()=>inspectCard(c,0,null,i);wireDrag(box,{kind:'card',i,id,category:c.category});hand.append(box);});if(scene?.type==='openingDeal')for(let i=0;i<5;i++){const space=el('div',undefined,'hand-card draw-destination');space.dataset.dealOwner='0';hand.append(space);}if(scene?.type==='drawFlight'&&scene.owner===0){const space=el('div',undefined,'hand-card draw-destination');space.setAttribute('aria-hidden','true');hand.append(space);}if(promotionChoice)hand.classList.add('promotion-muted');mat.append(hand);
    const dock=el('div',undefined,'action-dock'),help=el('span',game.winner?'对战结束，可返回选卡开始新的对局。':targetChoice?'完成上方选择后继续。':busy?'正在播放结算，请稍候。':game.current===1?'观察对手的操作；需要你选择时会暂停。':'拖动手牌或能量到发光位置使用；点击出战精灵选择技能。也可继续点击操作。','dock-help');dock.append(help);
    
    const buttons=el('div',undefined,'dock-buttons');if(targetChoice?.setup)buttons.append(actionButton('完成布置',()=>finishChoice(true),!game.players[0].active));else if(game.phase==='play'&&game.current===0&&!game.winner)buttons.append(actionButton('结束回合',()=>humanAction({type:'end'}),busy||!!targetChoice));dock.append(buttons);mat.append(dock);
    const logs=el('details',undefined,'battle-log-wrap');logs.open=logOpen;logs.append(el('summary','查看对战记录'),el('div',game.log.join('\n'),'battle-log'));arena.append(logs);fitBattle();renderBattleResult();
    if(speed>0&&!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)arena.querySelectorAll('[data-uid]').forEach(n=>{
      const before=previous.get(n.dataset.uid),after=n.getBoundingClientRect();if(before&&n.animate&&(Math.abs(before.x-after.x)>5||Math.abs(before.y-after.y)>5))
        n.animate([{transform:`translate(${before.x-after.x}px,${before.y-after.y}px)`},{transform:'translate(0,0)'}],{duration:350*speed,easing:'ease-out'});});
    if(!networkHooks&&game.current===1&&!game.winner&&game.phase==='play'&&!busy&&!targetChoice&&!scene&&aiTimer===null){const token=generation;
      aiTimer=setTimeout(()=>{aiTimer=null;aiTurn(token);},400*speed);}
  }
  $('beginBattle').onclick=async()=>{if(busy)return;busy=true;try{
    await start(available[Number($('humanDeck').value)],available[Number($('computerDeck').value)]);
  }catch(e){alert(e.message);}finally{busy=false;render();}};
  function networkConfigure(hooks){if(chooser){const previous=chooser;chooser=null;previous(null);}networkHooks=hooks;networkSearchCards=null;queuedHandDrop=null;if(aiTimer!==null){clearTimeout(aiTimer);aiTimer=null;}generation++;scene=null;targetChoice=null;selectedTarget=null;busy=false;}
  function networkCreate(decks){generation++;serial=0;game={players:decks.map((d,i)=>setupPlayer(clone(d),'玩家'+(i+1))),phase:'setup',revealed:false,current:0,totalTurns:0,winner:null,log:[],first:Math.random()<.5?0:1};return game;}
  function networkSetup(owner,index,slot=null,undo=null){if(game.phase!=='setup')return false;const p=game.players[owner];if(undo!==null){const m=byUid(p,undo);if(!m)return false;if(p.active===m)p.active=null;else p.bench.splice(p.bench.indexOf(m),1);p.hand.push(m.id);return true;}const id=p.hand[index];if(!id||card(id).stage!=='基础'||slot===null&&p.active||slot!==null&&(!Number.isInteger(slot)||slot<0||slot>=3||p.bench.some(m=>m.slot===slot)))return false;const m=createMon(p.hand.splice(index,1)[0],p);if(slot===null)p.active=m;else putBench(p,m,slot);return true;}
  function networkLoad(state,{locked=false,setup=false}={}){game=clone(state);scene=null;busy=locked;targetChoice=setup?{setup:true,title:'初始布阵',options:[]}:null;if(aiTimer!==null){clearTimeout(aiTimer);aiTimer=null;}showPage('battle');render();}
  async function networkPrompt(prompt){networkSearchCards=prompt.searchCards||null;busy=false;if(prompt.allocation)return new Promise(resolve=>{chooser=resolve;selectedTarget=null;targetChoice={...clone(prompt),picked:0};render();});render();return choose(0,prompt.title,prompt.options,prompt.optional);}
  async function networkEvent(event,state){game=clone(state);busy=true;targetChoice=null;scene=null;showPage('battle');render();const m=event.target?byUid(game.players[event.owner??game.current],event.target):null;
    if(event.type==='networkOpening'){for(const p of game.players){p.deck.unshift(...p.hand);p.hand=[];}await openingDeal();}
    else if(event.type==='networkDraw'){const p=game.players[event.owner];p.deck.unshift(event.cardId||null);if(p.deck.length>p.deckCount)p.deck.pop();await animatedDraw(event.owner,1,event.duration,null,event.reveal);}
    else if(event.type==='card'&&event.owner===1)await opponentPlayFlight(event.cardId,Math.max(0,game.players[1].hand.length-1));
    else if(event.type==='usedDiscard')await usedCardDiscard(event.owner,event.cardId);
    else if(event.type==='effect'&&event.title==='没有可检索的精灵'&&game.current===0){await choose(0,'选择加入手牌的精灵（向对方展示）',[{value:null,label:'完成检索'}],true);}
    else if(event.type==='networkEnergyInsert')await insertEffectEnergy(event.owner,event.energy,event.count,true);
    else if(event.type==='networkEnergyReady')await energyReady(event.owner);
    else if(event.type==='networkEvolve'&&m)await evolveFlight(event.owner,m,event.cardId,event.index);
    else if(event.type==='networkAttach'&&m)await attachFlight(event.owner,m,event.types);
    else if(event.type==='networkTransfer'){const ghosts=[],animations=[];try{for(const item of event.items){const from=arena.querySelector('[data-uid="'+item.source+'"]')?.getBoundingClientRect(),to=arena.querySelector('[data-uid="'+item.target+'"]')?.getBoundingClientRect();if(!from||!to)continue;const ghost=el('div',undefined,'transfer-energy-flight');ghost.append(energyChip(item.type));document.body.append(ghost);ghosts.push(ghost);if(speed>0)animations.push(ghost.animate([{transform:`translate(${from.x}px,${from.bottom-20}px)`},{transform:`translate(${(from.x+to.x)/2}px,${(from.bottom+to.bottom)/2-35}px) scale(1.4)`},{transform:`translate(${to.x}px,${to.bottom-20}px)`}],{duration:450*speed,fill:'forwards'}));}await sleep(450);}finally{animations.forEach(a=>a.cancel());ghosts.forEach(n=>n.remove());}}
    else if(event.type==='networkEnergyDiscard'&&m)await discardEnergyIndices(game.players[event.owner],m,event.indices);
    else if(event.type==='attackFx'){const attacker=mons(game.players[0]).concat(mons(game.players[1])).find(x=>x.uid===event.source);if(attacker)await attackWindup(attacker,()=>beat(event.type,event.title||'',event,event.duration||750));else await beat(event.type,event.title||'',event,event.duration||750);}
    else if(event.type==='networkSwitch'&&m)await forcedSwitch(game.players[event.owner],m,event.retreat);
    else if(event.type==='networkPromote'&&m)await promoteBench(event.owner,m);
    else if(event.type==='networkBasic'&&event.owner===1){const dest=arena.querySelector('[data-owner-zone="1"] .bench-row')?.children[event.slot]?.getBoundingClientRect();await opponentPlayFlight(event.cardId,event.index,dest);}
    else if(event.type==='place'||event.type==='networkBasic')await sleep(250);
    else await beat(event.type,event.title||'',event,event.duration||500);busy=true;render();}
  // 便于后续扩展与规则验证；决策函数不读取对手手牌内容或牌库顺序。
  window.RTCGBattle={rules:RULES,defaults:DEFAULTS,skills:SKILLS,cardsVersion:"A0-A1-20261005-r4",
    importDecks(incoming){if(!Array.isArray(incoming)||incoming.length>MAX_DECKS)throw new Error('卡组文件格式不正确或超过20组。');const valid=incoming.map(d=>normalizeDeck(d,d.id||crypto.randomUUID()));if(valid.some(d=>!validDeck(d)))throw new Error('文件包含不符合规则的卡组。');const next=savedDecks.filter(d=>!valid.some(x=>x.id===d.id)).concat(valid);if(next.length>MAX_DECKS)throw new Error('导入后超过20组，请先删除部分卡组。');oldPersistDecks(next);return valid.length;},
    networkConfigure,networkCreate,networkSetup,networkLoad,networkPrompt,networkEvent,validDeck,
    get state(){return game;},legalActions,perform,damageFor,canAttack,start,
    actionScore,resolveKO,beginTurn,applyStatus,statusCheckup,finishTurn,clearStatus,placeSetup,animatedDraw,openingDeal,placeOpponentBench,moveEnergyUI,standoutCard,recordContribution,
    setAnimationScale(value){speed=Math.max(0,Number(value)||0);},
    get choice(){return targetChoice;},finishChoice};
})();
