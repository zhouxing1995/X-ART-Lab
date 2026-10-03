const PLANS={
  monthly:{amount:359,interval:"month",mode:"subscription",name:"X-ART Lab. Monthly membership"},
  yearly:{amount:3818,interval:"year",mode:"subscription",name:"X-ART Lab. Annual membership"},
  institution:{amount:5000,mode:"payment",name:"X-ART Lab. Institutional custom research article"},
};
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{"content-type":"application/json;charset=UTF-8","cache-control":"no-store"}});

export async function onRequestPost({request,env}){
  if(!env.STRIPE_SECRET_KEY)return json({error:"Stripe 尚未配置，请在 Cloudflare Pages 中添加 STRIPE_SECRET_KEY"},503);
  let payload;try{payload=await request.json()}catch{return json({error:"请求格式无效"},400)}
  const plan=PLANS[payload.plan];if(!plan)return json({error:"请选择有效的订阅方案"},400);
  const origin=new URL(request.url).origin;
  const form=new URLSearchParams({
    mode:plan.mode,locale:"auto",billing_address_collection:"required","adaptive_pricing[enabled]":"false",
    "tax_id_collection[enabled]":"true","line_items[0][quantity]":"1",
    "line_items[0][price_data][currency]":"eur",
    "line_items[0][price_data][unit_amount]":String(plan.amount),
    "line_items[0][price_data][product_data][name]":plan.name,
    success_url:`${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:`${origin}/?checkout=cancelled`,
  });
  if(plan.interval)form.set("line_items[0][price_data][recurring][interval]",plan.interval);
  if(plan.mode==="subscription")form.set("subscription_data[metadata][xart_plan]",payload.plan);
  else{form.set("metadata[xart_plan]",payload.plan);form.set("payment_intent_data[metadata][xart_plan]",payload.plan)}
  const stripeResponse=await fetch("https://api.stripe.com/v1/checkout/sessions",{method:"POST",headers:{Authorization:`Bearer ${env.STRIPE_SECRET_KEY}`,"Stripe-Version":"2024-11-20.acacia","content-type":"application/x-www-form-urlencoded"},body:form});
  const session=await stripeResponse.json();
  if(!stripeResponse.ok)return json({error:session.error?.message||"Stripe 创建支付页面失败"},502);
  return json({url:session.url,mode:plan.mode,plan:payload.plan});
};
