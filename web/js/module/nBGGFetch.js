async function nBGGFetch(url,rr){
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
export default nBGGFetch;