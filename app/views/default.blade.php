<!DOCTYPE html>
<html>
    <head>
        <title>Login Messages!</title>
        {{ HTML::style('css/vendor/bootstrap.min.css') }}
        {{ HTML::style('css/vendor/bootstrap-theme.min.css') }}
        {{ HTML::style('css/main.css') }}

    </head>

    <body ng-app="app">
        <section id="credentials" class="container" ui-view>
            @yield('content')
        </section>

        {{ HTML::script('js/vendor/jquery.min.js') }}
        {{ HTML::script('js/vendor/bootstrap.min.js') }}
        {{ HTML::script('js/vendor/angular.min.js') }}
        {{ HTML::script('js/vendor/angular-ui-router.min.js') }}
        {{ HTML::script('js/main.js') }}

    </body>

</html>