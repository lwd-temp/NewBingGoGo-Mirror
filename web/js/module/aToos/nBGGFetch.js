/**
 * 自定义的fetch，用于返回自定义异常
 * */
export default async function nBGGFetch(url,rr){
   let re = await fetch(url,rr)
   if(re.headers.get('NewBingGoGoError')){
       let json = await re.json();
       let error= new Error(json.message);
       error.value = json.value;
       error.isNewBingGoGoError = true;
       throw error;
   }
   return re;
}