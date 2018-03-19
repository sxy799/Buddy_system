/*  全局变量的声明   */
var buddy = new Array("2","4","8","16","32","64","128","256","512","1024"); //分区大小 2的k次幂
var free1 = new Array("0","0","0","0","0","0","0","0","0","1"); //空闲分区的个数   初始内存大小1024
var use =new Array(100);  //已分配分区表  最多为100个进程分配 记录已分配分区大小，内存地址
var str  = new Array(100);
for (var per = 0; per <= 100; per++)
{
  use[per] = new Array(2);
}

var free_addr = new Array(10); //空闲分区的首地址 [i][j]表示2的i次方大小的空闲分区的第j个分区的首地址
for (var per = 0; per <= 10; per++)
{
   free_addr[per] = new Array(50);
}
free_addr[9][0] = 0;
var maxsize=9;  //最大空闲分区 初始为1024
var usenum=0;   //进程数 初始为0


/*  申请内存函数 */ 
function applyin()
{
    var input = document.getElementById("apply-size");
    var name = document.getElementById("apply-name").value;
    var i,j,usepage,remain,start;
    console.log("input" + input);
    console.log("name"+ name);
   if (input.value=='')
   {
         alert("请输入您要申请的内存大小！");
         document.getElementById("apply-size").focus();
   }
   else  if (name == '')
   {
         alert("请输入您要申请的内存名字！");
         document.getElementById("apply-name").focus();
   }
    
   else
   {
           var size = parseInt(input.value);
           if(size<1 || size>1024)
          {
              alert("请输入1~1024之间的数字！");
              document.getElementById("apply-size").focus();
          }
          else if( size >  parseInt(buddy[maxsize]))
          {
              alert("没有足够的内存空间，请先释放！") ;
               document.getElementById("release-size").focus();
          }
          else
          {

                for(i=0; i<10; i++)   ///寻找合适的空闲分区 从小的开始找
                {
                    if(free1[i]!=0 && buddy[i]>=size)
                        break;
                }
                usepage=i;
                free1[i]--;
                for(i=0; i<10; i++)    /// 寻找分配的大小
                {
                    if(buddy[i]>=size)
                        break;
                }
                str[usenum] = name;
                use[usenum][0]=i;   ///记录分配给该进程的空闲区大小 2的i次方
                use[usenum][1]=free_addr[usepage][free1[usepage]];  /// 内存起始地址
                console.log(free_addr[usepage][free1[usepage]]);
                console.log('use[usenum][1]' + use[usenum][1]);
                remain=buddy[usepage]-buddy[use[usenum][0]];  ///剩余大小
                start=Number(free_addr[usepage][free1[usepage]])+Number(buddy[usepage]-buddy[usepage-1]); ///空闲区首地址
                usenum++;
                for(i=usepage-1; i>=0; i--) ///确定其他空闲分区的首地址
                {
                    if(remain>=buddy[i])
                    {
                        free1[i]++;
                        free_addr[i][free1[i]-1]=start;
                        remain-=buddy[i];    ///剩余大小
                        start-=buddy[i-1];   ///首地址
                    }
                    if(remain==0)
                        break;
                }
                if(free1[maxsize]==0)   ///确定最大空闲分区
                {
                    maxsize=0;
                    for(i=9; i>=0; i--)
                    {
                        if(free1[i]!=0)
                        {
                            maxsize=i;
                            break;
                        }
                 
                   }
                }
                alert("申请内存成功！");
          }
  }
  document.getElementById("apply-name").value =input.value = "";
}

/*  释放内存函数 */
function releaseout()
{

	var i,j,k,flag,f=0;
	var input = document.getElementById("release-size");
	var free_start = parseInt(input.value);
    
   if (input.value=='')
   {
        alert("请输入您要释放内存的首地址！");
        document.getElementById("release-size").focus();
   }  
   else 
   {
			for(i=0,flag=0; i<usenum; i++) //匹配已分配首地址
		{
		    if(free_start==use[i][1])
		    {
		        free_start=i;
		        flag=1;
		        break;
		    }
		}
		if(flag==0)
		{
		    alert("输入的首地址不存在，请重新输入！\n");
		}
		else
		{
		    for(i=use[free_start][0]; i<9; i++) //寻找是否有伙伴可以合并
		    {
		        for(j=0,flag=0; j<free1[i]; j++)
		        {
		            if(use[free_start][1]+buddy[use[free_start][0]]==free_addr[i][j])
		            {
		                // 左合并  伙伴内存地址高
		                use[free_start][0]++;   //往上去找  还能合并否
		                free1[i]--;
		                for(k=0; k<free1[i]; k++) // 伙伴的地址被覆盖
		                    free_addr[i][j]=free_addr[i][j+1];  //
		                flag=1;
		                break;
		            }
		            if(use[free_start][1]-buddy[use[free_start][0]]==free_addr[i][j])
		            {
		                // 右合并  伙伴内存地址为低
		                use[free_start][0]++;
		                use[free_start][1]=free_addr[i][j];
		                free1[i]--;
		                for(k=0; k<free1[i]; k++) // 伙伴的地址被覆盖
		                    free_addr[i][j]=free_addr[i][j+1];//
		                flag=1;
		                break;
		            }
		            if(flag==0 && j==free1[i]-1)
		            {
		                // 不能合并
		                free1[use[free_start][0]]++;
		                free_addr[use[free_start][0]][free1[use[free_start][0]]-1]=use[free_start][1];
		                f=1;
		                break;
		            }
		        }

		        if(flag==1)
		            continue;
		        else
		            break;
		    }
		    if(f==0)
		    {
		        free_addr[use[free_start][0]][free1[use[free_start][0]]]=use[free_start][1];//添加到空闲分区
		        free1[use[free_start][0]]++;
		    }
		    usenum--;
		    for(i=free_start; i<usenum+1; i++) // 清除占用的内存
		    {
		        use[i][0]=use[i+1][0];
		        use[i][1]=use[i+1][1];
		    }
		    alert("释放内存成功！");
		} 
		
   }
   input.value = ''; 
}

/* 显示内存占用和剩余情况 */
function show()
{
	/*for (var per = 0; per < usenum; per++)
	{
		var tmp = Number(use[per][1]) + Number(buddy[use[per][0]]-1);
	  console.log(per + "起止地址" + use[per][1] + '+' + tmp);
	  
	}*/
// 1 .  遮罩层  在show-memory 添加  oMask
    /// 遮罩层

        //获取页面宽 高
        var sHeight = document.documentElement.scrollHeight;
        var sWidth = document.documentElement.scrollWidth;
        // 获取可视区域 
        var wHeight = document.documentElement.clientHeight;
        
        var oMask = document.createElement("div"); 
        oMask.id = "mask";
        document.body.appendChild(oMask);
        oMask.style.width = sWidth + "px";
        oMask.style.height = sHeight + "px";

    /// table_wrap
 
        var table_wrap = document.createElement("div");
       table_wrap.id = "situation";

       table_wrap.innerHTML = "<p style = 'font-size:25px;font-style: bold; font-family:Arial; color:white; text-align: center'>此时内存使用情况：</p>";
       //原宿 宽高 
       document.body.appendChild(table_wrap);///顺序 
       var dHeight = table_wrap.offsetHeight;//已有的
       var dWidth = table_wrap.offsetWidth;
        table_wrap.style.left = (sWidth - dWidth)/2 + "px";
        table_wrap.style.top = (wHeight - dHeight)/2 + "px";

    // 2. 内容
       var table = document.createElement("table");
       table.id = "memory";

       //原宿 宽高 
        table_wrap.appendChild(table);
	    table.innerHTML = "<tr><th width='10%'>序号</th><th width='15%'>状态</th><th width='15%'>名字</th><th width='30%'>内存起止地址为：</th></tr>";
	      // 优化部分  
	       var start = 0,ct=1;
	       var  i=0;
	       while(true)
	        {
	            if (i == usenum)break;
	            //  js 添加 HTML   
	          
	            if (use[i][1] > start)
	            {
	              var tr = document.createElement('tr');
	              var td1 = document.createElement('td');
	              var td2 = document.createElement('td');
	              var td3 = document.createElement('td');
	              var td4 = document.createElement('td');
	              // 在容器元素中放入其他元素
	               table.appendChild(tr);
	               tr.appendChild(td1);
	               tr.appendChild(td2);
	               tr.appendChild(td3);
	               tr.appendChild(td4);
	              // 属性
	              // 样式 
	      
	              // 文本
	              
	                td1.innerHTML = ct++;
	                td2.innerHTML = "空闲"; 
	                td3.innerHTML = "*";
	                
	                var addend = ""; 
	                console.log('空闲 1 addend' + addend);
	                addend =  parseInt(use[i][1] -1);
	                td4.innerHTML = start + '-' + addend;
	                console.log('空闲 2 addend' + addend);
	               // printf("第 %d 个：状态：空闲 内存起止地址：%4d - %4d \n",ct++,start,use[i][1]-1);
	                start = use[i][1];
	              
	            }
	            if (use[i][1] == start)
	            {
	              var tr = document.createElement('tr');
	              var td1 = document.createElement('td');
	              var td2 = document.createElement('td');
	              var td3 = document.createElement('td');
	              var td4 = document.createElement('td');
	               // 在容器元素中放入其他元素
	                table.appendChild(tr);
	                tr.appendChild(td1);
	                tr.appendChild(td2);
	                tr.appendChild(td3);
	                tr.appendChild(td4);
	              // 属性
	              // 样式
	              // 文本
	              
	                td1.innerHTML = ct++;
	                td2.innerHTML = "占用"; 
	                td3.innerHTML = str[i];
	               
	                var addend = "";
	                addend = parseInt(use[i][1]) + parseInt(buddy[use[i][0]] - 1 );
	                console.log('占用 1 addend' + addend);
	                td4.innerHTML = use[i][1] + '-' + addend;
	                console.log('占用 2 addend' + addend);
	                //printf("第 %d 个：状态： 内存起止地址：%4d -%4d\n",ct++,use[i][1],use[i][1]+buddy[use[i][0]]-1);
	                start = addend +1;
	                i++;  
	            } 
	        }
	        console.log("start " + start);
	        if (start < 1023)
	        {
	        	console.log("******");
	            var endd = 1023;
	            //printf("第 %d 个：状态 空闲 内存起止地址：%4d - %4d \n",ct++,start,endd);
	             //  js 添加 HTML  
	            // 添加
	            var tr = document.createElement('tr');
	            var td1 = document.createElement('td');
	            var td2 = document.createElement('td');
	            var td3 = document.createElement('td');
	            var td4 = document.createElement('td');
	            // 在容器元素中放入其他元素
	            table.appendChild(tr);
	            tr.appendChild(td1);
	            tr.appendChild(td2);
	            tr.appendChild(td3);
	            tr.appendChild(td4);
	            // 属性
	            // 样式
	   
	            // 文本
	             td1.innerHTML = ct++;
	             td2.innerHTML = "空闲"; 
	             td3.innerHTML = "*";
	             console.log('addend' + endd);
	             td4.innerHTML = start+ '-' + endd;
	            // printf("第 %d 个：状态：空闲 内存起止地址：%4d - %4d \n",ct++,start,use[i][1]-1);
	        }
	             // gai
        oMask.onclick = function()
        {
          document.body.removeChild(oMask);
          document.body.removeChild(table_wrap);
         /* document.body.removeChild(table);*/
        }

}
/* 关闭  */ 
function shutwin()
{
  var cmd = confirm("您确定要关闭本窗口？");
  if (cmd == true)
  {
   window.close();
  }
  else
  {

  }
  return ;
}
/* 刷新   */
function reset()
{
   history.go(0);
   alert("刷新成功！");
}
