import axios from 'axios';

async function getPage(url,page=1) {
	let response = await axios.get(url,{params: {page}}).then(res=>res.data);
	return response
}

export async function getPaginatedData(url,page=1) {
	let results = [];
	let pageData;
	do {
		pageData = await getPage(url,page);
		if(pageData.results && pageData.results.length)
			results = results.concat(pageData.results);
		else
			break;
		page += 1;
	}while(pageData && pageData.next)
	return results;
}