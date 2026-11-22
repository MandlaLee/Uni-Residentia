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
  // Accessible dropdown navigation: desktop and mobile.
  const groups=[...document.querySelectorAll("[data-ur-dropdown]")];
  const dismissDropdowns=(except=null)=>groups.forEach(group=>{
    if(group===except)return;
    group.classList.remove("is-open");
    const button=group.querySelector("[data-ur-toggle]");
    if(button)button.setAttribute("aria-expanded","false");
  });
  groups.forEach(group=>{
    const btn=group.querySelector("[data-ur-toggle]");
    if(!btn)return;
    btn.addEventListener("click",e=>{
      e.stopPropagation();
      const shouldOpen=!group.classList.contains("is-open");
      dismissDropdowns();group.classList.toggle("is-open",shouldOpen);
      btn.setAttribute("aria-expanded",String(shouldOpen));
    });
  });
  document.addEventListener("click",e=>{if(!e.target.closest("[data-ur-dropdown]"))dismissDropdowns();});
  document.addEventListener("keydown",e=>{if(e.key==="Escape")dismissDropdowns();});
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
    { key:"private", eyebrow:"YOUR OWN SPACE", heading:"Private Bedroom", tagline:"A calm place to recharge",
      description:"Discover private-bedroom options with comfortable furnishings and space to study, rest and make your room feel like home.",
      images:["single-bedroom","study-room","living-room"], tags:["Private space","Study ready","Everyday comfort"], link:"investment.html" },
    { key:"social", eyebrow:"MAKE ROOM FOR FRIENDS", heading:"Social Spaces", tagline:"Life together",
      description:"Relax after lectures, catch up with friends and enjoy shared moments in welcoming lounges and social areas.",
      images:["living-room","dining-room","courtyard"], tags:["Shared lounge","Relax & unwind","Make connections"], link:"experience.html" },
    { key:"study", eyebrow:"SPACE TO FOCUS", heading:"Study Spaces", tagline:"Make every hour count",
      description:"Settle into a study-friendly space for coursework, exam preparation and the quiet time your goals deserve.",
      images:["study-room","single-bedroom","reception"], tags:["Focus time","Study areas","Daily routines"], link:"experience.html" },
    { key:"sharing", eyebrow:"YOUR PEOPLE, YOUR PLACE", heading:"Sharing Rooms", tagline:"Better together",
      description:"Sharing rooms offer a practical student-living option with a place for your essentials and a study routine of your own.",
      images:["sharing-bedroom","dining-room","living-room"], tags:["Shared rooms","Student living","Practical comfort"], link:"investment.html" },
    { key:"gym", eyebrow:"FIND YOUR BALANCE", heading:"Gym & Fitness", tagline:"Move your way",
      description:"Give yourself a break from the books and discover fitness and recreation spaces within our accommodation experience.",
      images:["fitness-room","courtyard","gaming-room"], tags:["Keep active","Recharge","Room to move"], link:"experience.html" },
    { key:"community", eyebrow:"LIVE THE MOMENTS", heading:"Community & Events", tagline:"Belong here",
      description:"Great student memories happen outside the lecture hall. Find common areas where everyday conversations can become friendships.",
      images:["courtyard","gaming-room","dining-room"], tags:["Community spaces","Downtime","New friendships"], link:"experience.html" },
    { key:"team", eyebrow:"STUDENT SUPPORT", heading:"On-Site Team", tagline:"Here to help",
      description:"Need guidance about your room, shared facilities or day-to-day arrangements? Our team is your starting point for assistance.",
      images:["reception","gate-entrance","corridor"], tags:["Ask questions","Resident support","Get in touch"], link:"contact.html" },
  ];
  const tabs = Array.from(root.querySelectorAll('[role="tab"][data-ur-slide]'));
  const heading = root.querySelector("[data-ur-heading]");
  const eyebrow = root.querySelector("[data-ur-eyebrow]");
  const tagline = root.querySelector("[data-ur-tagline]");
  const description = root.querySelector("[data-ur-description]");
  const visual = root.querySelector("[data-ur-visual]");
  const panel = root.querySelector('[role="tabpanel"]');
  const link = root.querySelector(".ur-showcase__link");
  const tagNodes = Array.from(root.querySelectorAll(".ur-showcase__icons span"));
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
      eyebrow.textContent = slide.eyebrow;
      tagline.textContent = slide.tagline;
      description.textContent = slide.description;
      link.href = slide.link;
      tagNodes.forEach((node,i) => {if (slide.tags[i]) node.textContent = slide.tags[i];});
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
