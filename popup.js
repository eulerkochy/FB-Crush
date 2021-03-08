$(function (){
    $('#know_crush_btn').one('click',function(){
        // console.log('popup button clicked');
        let myusername = null;
        chrome.runtime.sendMessage({type :'popupClick'},
        function (response) {
            // console.log(response);
            myusername = response.username;
            var crushList = response.crush.filter((item)=>{return item.crushname != ''}).map(function(item){
                if (item.hasCrush)
                    return `<li class="list-group-item d-flex justify-content-between list-group-item-danger">
                                ${item.crushFullName} 
                            <a class="badge badge-light delete_me" name="${item.crushname}"><i class="fas fa-times"></i></a>
                            </li>`;
                else 
                    return `<li class="list-group-item d-flex justify-content-between list-group-item-info">
                                ${item.crushFullName} 
                            <a class="badge badge-info delete_me" name="${item.crushname}"><i class="fas fa-times"></i></a>
                            </li>`;
            });
            // console.log(crushList);
            if (crushList.length > 0){
                $("#crush_list").append(crushList);
            }
            $("#crush_list a.delete_me").on('click', function(){
                const crushname = $(this).prop('name');
                chrome.runtime.sendMessage({
					type: 'deleteDB',
					username: myusername,
					crushname: crushname
				});
                $(this).parent().remove();
            });

        });
    });
});