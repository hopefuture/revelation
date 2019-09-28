(
  function () {
    var doc = document;
    var win = window;
  
    // 加载数据
    var loadPageData = function (pageNum, pageSize, clear) {
      // TODO 这里替换成后台接口数据
      return fetch(`/data/news.json?pageNum=${pageNum}&pageSize=${pageSize}`, {
        method: 'get',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json; charset=utf-8'
        }
      })
        .then(response =>
          response.json().then(json => ({ json, response }))
        ).then(({ json, response }) => {
          if (!response.ok) {
            var error = new Error('获取数据出错');
            return Promise.reject(error);
          }
          // 模拟后台处理一下总页数
          renderList(json.data.list, clear);
          return json;
        }).catch((error) => {
          return Promise.reject(error);
        });
    };
  
    // 渲染列表
    function renderList (data, clear) {
      var newsList = doc.getElementById('newsList');
      if (clear) {
        newsList.innerHTML = '';
      }
      var fragment = doc.createDocumentFragment();
      var tmp = fragment.appendChild(doc.createElement('div'));
    
      var tmpl = doc.getElementById('newsListTmpl').innerHTML;
      if (data && data.length > 0) {
        data.forEach((item) => {
          // 后端改成实际的详情链接
          item.href = './news-detail.html?id=' + item.id;
          var content = win.nunjucks.renderString(tmpl, item);
          tmp.innerHTML = content;
          newsList.append(tmp.children[0]);
        });
      }
    }
    
    var loadMore = new win.LoadMore({
      pageContainer: '#paging',
      listContainer: '#newsList',
      loadPageData: loadPageData,
      loader: function (loading, hasMore) {
        let loadingMask = doc.querySelector('.loading-mask');
        if (loading) {
          if (!loadingMask) {
            loadingMask = doc.createElement('div');
            loadingMask.classList.add('loading-mask');
            loadingMask.innerHTML = '<div class="loading-icon"></div>';
            doc.body.appendChild(loadingMask);
          }
          setTimeout(() => {
            loadingMask.classList.add('show');
          });
          doc.body.classList.add('loading-open');
        } else {
          doc.body.removeChild(doc.querySelector('.loading-mask'));
          doc.body.classList.remove('loading-open');
        }
      }
    });
  }
)();
