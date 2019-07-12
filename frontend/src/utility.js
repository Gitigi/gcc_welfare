import axios from 'axios';

async function getPage(url,params) {
	let response = await axios.get(url,{params}).then(res=>res.data);
	return response
}

export async function getPaginatedData(url,params={}) {
	let results = [];
	let pageData;
	let page = 1;
	if(params.page)
		page = params.page;
	do {
		pageData = await getPage(url,{...params,page});
		if(pageData.results && pageData.results.length)
			results = results.concat(pageData.results);
		else
			break;
		page += 1;
	}while(pageData && pageData.next)
	return results;
}