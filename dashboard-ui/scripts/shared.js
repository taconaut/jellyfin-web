define(["jQuery","libraryBrowser","imageLoader","indicators"],function($,libraryBrowser,imageLoader,indicators){"use strict";function reload(page){var id=getParameterByName("id");Dashboard.showLoadingMsg(),ApiClient.getJSON(ApiClient.getUrl("Social/Shares/Public/"+id+"/Item")).then(function(item){reloadFromItem(page,item)})}function reloadFromItem(page,item){currentItem=item,libraryBrowser.renderName(item,$(".itemName",page)[0],!1),libraryBrowser.renderParentName(item,$(".parentName",page)[0]),libraryBrowser.renderDetailPageBackdrop(page,item,imageLoader),renderImage(page,item),setInitialCollapsibleState(page,item),ItemDetailPage.renderDetails(page,item,null,!0),Dashboard.hideLoadingMsg()}function setInitialCollapsibleState(page,item){$(".collectionItems",page).empty(),item.MediaSources&&item.MediaSources.length&&ItemDetailPage.renderMediaSources(page,null,item);var chapters=item.Chapters||[];chapters.length?($("#scenesCollapsible",page).show(),ItemDetailPage.renderScenes(page,item,null,3,!0)):$("#scenesCollapsible",page).hide(),item.People&&item.People.length?($("#castCollapsible",page).show(),ItemDetailPage.renderCast(page,item,null,6,!0)):$("#castCollapsible",page).hide(),ItemDetailPage.renderCriticReviews(page,item,1)}function renderImage(page,item){libraryBrowser.renderDetailImage(page.querySelector(".detailImageContainer"),item,!1,null,imageLoader,indicators)}var currentItem;$(document).on("pageinit","#publicSharedItemPage",function(){var page=this;$(page).on("click",".moreScenes",function(){ItemDetailPage.renderScenes(page,currentItem,null,null,!0)}).on("click",".morePeople",function(){ItemDetailPage.renderCast(page,currentItem,null,null,!0)}).on("click",".moreCriticReviews",function(){ItemDetailPage.renderCriticReviews(page,currentItem)})}).on("pageshow","#publicSharedItemPage",function(){var page=this;reload(page)})});