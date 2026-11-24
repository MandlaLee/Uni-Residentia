"use strict";
const UR_API = "https://cinpqzwltwmuzqjpazju.supabase.co";
const UR_KEY = "sb_publishable_2QJbiuQOSsrayG7LdpFsPg_hQbhN9A3";
const $ = (sel, root=document) => root.querySelector(sel);
document.addEventListener("DOMContentLoaded", () => {
  const navbar = $("#navbar");
  const nav = $("#navMenu"), toggle = $("#mobileToggle");
  if (toggle && nav) {
    const close = () => {nav.classList.remove("is-open");toggle.setAttribute("aria-expanded","false");toggle.setAttribute("aria-label","Open menu");};
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded",String(open));
      toggle.setAttribute("aria-label",open?"Close menu":"Open menu");
    });
    nav.querySelectorAll("a").forEach(link=>link.addEventListener("click",close));
    document.addEventListener("keydown",event=>{if(event.key==="Escape")close();});
  }
  if(navbar) navbar.classList.add("navbar--scrolled");
  const params = new URLSearchParams(window.location.search);
  const residence = $("#residence"), room = $("#roomType");
  if(residence && ["willows","universitas","brandwag","wesdene","either"].includes(params.get("residence"))) residence.value=params.get("residence");
  if(room && ["single","sharing","either"].includes(params.get("room"))) room.value=params.get("room");
  const setStatus = (node,msg,success=false) => {
    if(!node)return;
    node.textContent=msg;
    node.classList.toggle("is-success",success);
  };
  async function submitRecord(table,record) {
    const response=await fetch(UR_API+"/rest/v1/"+table,{
      method:"POST",
      headers:{"Content-Type":"application/json","apikey":UR_KEY,"Prefer":"return=minimal"},
      body:JSON.stringify(record)
    });
    if(!response.ok) {
      let detail;
      try{const e=await response.json();detail=e?.message;}catch{}
      throw new Error(detail && response.status<500 ? detail : "The service couldn't save your submission. Please try again.");
    }
    return true;
  }
  const application = $("#applicationForm");
  if(application) application.addEventListener("submit",async e=>{
    e.preventDefault();if(!application.reportValidity())return;
    const state=$("#applicationStatus"), btn=$('button[type="submit"]',application);
    const f=new FormData(application);
    if((f.get("website")||"").trim())return;
    const payload={
      first_name:String(f.get("firstName")||"").trim(),last_name:String(f.get("lastName")||"").trim(),
      email:String(f.get("email")||"").trim().toLowerCase(),phone:String(f.get("phone")||"").trim(),
      institution:String(f.get("institution")||"").trim(),
      student_number:String(f.get("studentNumber")||"").trim()||null,
      study_year:String(f.get("studyYear")||"").trim()||null,
      residence:String(f.get("residence")||""),room_type:String(f.get("roomType")||""),
      academic_year:Number(f.get("academicYear")||2027),
      message:String(f.get("message")||"").trim()
    };
    btn.disabled=true;setStatus(state,"Sending your application securely…");
    try{
      await submitRecord("ur_applications",payload);
      setStatus(state,"Your application was received successfully. Please check your email for any follow-up from the Uni Residentia team.",true);
      application.reset();
    }catch(error){
      setStatus(state,error?.message || "Couldn't submit your application. Please retry.");
    }finally{btn.disabled=false;}
  });
  const contact=$("#contactForm");
  if(contact){
    const topic=params.get("topic");
    const selector=contact.querySelector('[name="subject"]');
    if(topic&&selector&&[...selector.options].some(opt=>opt.value===topic)){
      selector.value=topic;
      const message=contact.querySelector('[name="message"]');
      const examples={
        "WhatsApp group invite":"Please send me an invitation to the Uni Residentia WhatsApp group.",
        "WhatsApp direct chat":"Please message me directly on WhatsApp about accommodation.",
        "Call back request":"Please call me about Uni Residentia accommodation.",
        "Office visit":"Please share office directions and how to arrange a visit.",
        "Email enquiry":"I would like information about Uni Residentia accommodation."
      };
      if(message&&examples[topic]&&!message.value)message.value=examples[topic];
    }
  }
  if(contact)contact.addEventListener("submit",async e=>{
    e.preventDefault();if(!contact.reportValidity())return;
    const f=new FormData(contact),btn=$('button[type="submit"]',contact),state=$("#contactStatus");
    if((f.get("website")||"").trim())return;
    const payload={name:String(f.get("name")||"").trim(),email:String(f.get("email")||"").trim().toLowerCase(),phone:String(f.get("phone")||"").trim()||null,subject:String(f.get("subject")||""),message:String(f.get("message")||"").trim()};
    if(["WhatsApp group invite","WhatsApp direct chat","Call back request"].includes(payload.subject)&&!payload.phone){
      setStatus($("#contactStatus"),"Please enter your phone or WhatsApp number so we can contact you.");contact.querySelector('[name="phone"]').focus();return;
    }
    btn.disabled=true;setStatus(state,"Sending your message…");
    try{
      await submitRecord("ur_messages",payload);
      setStatus(state,"Your message was received. The Uni Residentia team can review it in their secure inbox.",true);
      contact.reset();
    }catch(error){setStatus(state,error?.message||"Couldn't send your message. Please try again.");}
    finally{btn.disabled=false;}
  });
});


/* Uni Residentia: in-place photo and content switcher (no sliding panels) */
document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector("[data-ur-showcase]");
  if (!root) return;
  const slides = [
    {key:"private",heading:"Single rooms",description:"Private bedrooms for study and rest.",images:["single-bedroom","study-room","living-room"],link:"investment.html"},
    {key:"social",heading:"Social spaces",description:"Shared lounges and places to unwind.",images:["living-room","dining-room","courtyard"],link:"experience.html"},
    {key:"study",heading:"Study spaces",description:"Areas for focused work and revision.",images:["study-room","single-bedroom","reception"],link:"experience.html"},
    {key:"sharing",heading:"Sharing rooms",description:"Practical shared accommodation.",images:["sharing-bedroom","dining-room","living-room"],link:"investment.html"},
    {key:"gym",heading:"Fitness",description:"Ask about recreation facilities at your chosen residence.",images:["fitness-room","courtyard","gaming-room"],link:"experience.html"},
    {key:"community",heading:"Community",description:"Everyday spaces to connect with other residents.",images:["courtyard","gaming-room","dining-room"],link:"experience.html"},
    {key:"team",heading:"Support",description:"Contact the team about your accommodation.",images:["reception","gate-entrance","corridor"],link:"contact.html"},
  ];
  const tabs = Array.from(root.querySelectorAll('[role="tab"][data-ur-slide]'));
  const heading = root.querySelector("[data-ur-heading]");
  const description = root.querySelector("[data-ur-description]");
  const visual = root.querySelector("[data-ur-visual]");
  const panel = root.querySelector('[role="tabpanel"]');
  const link = root.querySelector(".ur-showcase__link");
  const images = ["main", "top", "bottom"].map(position => root.querySelector('[data-ur-image="' + position + '"]'));
  if (tabs.length !== slides.length || images.some(item => !item)) return;
  let active = 0, isVisible = false, timer = null, updateTimer = null;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const preload = Array.from(new Set(slides.flatMap(s => s.images)));
  preload.forEach(name => {const image = new Image();image.src = "images/rooms/" + name + ".webp";});
  function activate(next, focus = false) {
    const index = ((next % slides.length) + slides.length) % slides.length;
    const slide = slides[index];
    active = index;
    tabs.forEach((tab, i) => {
      const selected = i === index;
      tab.classList.toggle("is-active", selected);
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    panel.setAttribute("aria-labelledby", tabs[index].id);
    if (focus) tabs[index].focus({preventScroll:true});
    if (updateTimer) clearTimeout(updateTimer);
    if (!reduceMotion) visual.classList.add("is-switching");
    const write = () => {
      heading.textContent = slide.heading;
      description.textContent = slide.description;
      link.href = slide.link;
      images.forEach((element,i) => {
        element.src = "images/rooms/" + slide.images[i] + ".webp";
        element.alt = slide.heading + " — " + (i === 0 ? "main room image" : i === 1 ? "additional student space" : "shared student facility");
      });
      visual.classList.remove("is-switching");
    };
    if (reduceMotion) write();
    else updateTimer = setTimeout(write, 140);
  }
  tabs.forEach((tab,i) => {
    tab.addEventListener("click", () => {activate(i);restart();});
    tab.addEventListener("keydown", event => {
      let next;
      if (event.key === "ArrowRight") next = i + 1;
      else if (event.key === "ArrowLeft") next = i - 1;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = slides.length - 1;
      if (next !== undefined) {event.preventDefault();activate(next,true);restart();}
    });
  });
  function restart() {
    if (timer) clearInterval(timer);
    if (reduceMotion) return;
    timer = setInterval(() => {
      if (isVisible && !document.hidden) activate(active + 1);
    }, 4000);
  }
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {isVisible=entries[0]?.isIntersecting ?? false;}, {threshold:.15});
    observer.observe(root);
  } else isVisible=true;
  restart();
});
