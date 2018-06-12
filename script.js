function formatRepo(repo) {
  if (repo.loading) {
    return repo.text;
  }

  var markup = "<div class='select2-result-repository clearfix'>" +
    "<div class='select2-result-repository__avatar'><img src='" + repo.owner.avatar_url + "' /></div>" +
    "<div class='select2-result-repository__meta'>" +
    "<div class='select2-result-repository__title'>" + repo.name + '/' + repo.owner.login + "</div>";

  if (repo.description) {
    markup += "<div class='select2-result-repository__description'>" + repo.description + "</div>";
  }

  markup += "<div class='select2-result-repository__statistics'>" +
    "<div class='select2-result-repository__forks'><i class='fa fa-flash'></i> " + repo.forks_count + " Forks</div>" +
    "<div class='select2-result-repository__stargazers'><i class='fa fa-star'></i> " + repo.stargazers_count + " Stars</div>" +
    "<div class='select2-result-repository__watchers'><i class='fa fa-eye'></i> " + repo.watchers_count + " Watchers</div>" +
    "</div>" +
    "</div></div>";

  return markup;
}

function formatRepoSelection(repo) {
  return repo.full_name || repo.text;
}

$(".repo-ajax").select2({
  ajax: {
    url: "https://api.github.com/search/repositories",
    dataType: 'json',
    delay: 250,
    data: function (params) {
      return {
        q: params.term + "in:name",
        page: params.page
      };
    },
    processResults: function (data, params) {
      data.items = _.orderBy(data.items, ['name'], ['asc']);
      params.page = params.page || 1;
      return {
        results: data.items,
        pagination: {
          more: (params.page * 30) < data.total_count
        }
      };
    },
    cache: true
  },
  placeholder: 'Search for a repository or user',
  escapeMarkup: function (markup) {
    return markup;
  },
  templateResult: formatRepo,
  minimumInputLength: 2,
  templateSelection: formatRepoSelection
});

$(".repo-ajax").on('select2:select', function (e) {
  var value = e.params.data;
  $('#repo-list').empty();
  $('#repo-name').empty();
  $('#all-issues').empty();
  $('.repo-array').empty();
  $('.repo-array').hide();
  $('#repo-name').text(' for ' + value.name);
  $.get(value.url + "/issues?state=open", function (data, status) {
    if (typeof data !== 'undefined' && data.length > 0) {
      $('<a href="' + value.html_url + '/issues">All issues</a>').appendTo($('#all-issues'));
      $.each(data, function (i, issue) {
        var repoListTemplate = '<div class="media text-muted pt-3"><img src="' + issue.user.avatar_url + '" alt="" class="mr-2 rounded" style="width: 32px; height: 32px;"> \
        <div class="media-body pb-3 mb-0 small lh-125 border-bottom border-gray"> \
        <div class="d-flex justify-content-between align-items-center w-100"> \
        <strong class="text-gray-dark">' + issue.title + '</strong> \
        <a href="' + issue.html_url + '" target="_blank">View in github</a> \
        </div>  <span class="d-block"><a href="' + issue.user.html_url + '" \ target="_blank">@' + issue.user.login + '</a></span> </div></div>';
        $(repoListTemplate).appendTo($('#repo-list'));
      });
      $.get(value.url + "/labels", function (data, status) {
        if (typeof data !== 'undefined' && data.length > 0) {
          $('.repo-array').show();
          $(".repo-array").select2({
            data: _.map(data, 'name'),
            placeholder: 'Select an label'
          });
        }
      });
    } else {
      $('<small>No issues found..</small>').appendTo($('#repo-list'));
    }
  });
});