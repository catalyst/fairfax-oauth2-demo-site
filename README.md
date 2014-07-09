Stuff Nation OAuth2.0 Integration Demo
======================================


## 0. Overview ##

This test server is intended for use as a reference by developers needing to integrate
with the Stuff Nation OAuth2 endpoint.

If you're already familiar with OAuth2 then you shouldn't find anything surprising here,
just plain old <a href="https://tools.ietf.org/html/rfc6749">RFC 6749</a>.

Note that this example doesn't request explicit scopes and doesn't pass through an additional state parameter.

  * Currently Stuff Nation only exposes the <tt>read-only</tt> scope.
  * The <tt>state</tt> parameter is an essential tool for preventing CSRF attacks. We strongly recommend using it for live public sites.


## 1. Getting started ##

This example provides an Ubuntu 14 (64 bit) <a href="http://vagrantup.com">Vagrant</a> file that provides
all of the dependencies required to run the demo site.

  1.1. Clone the repository

    > git clone git@github.com:catalyst/fairfax-oauth2-demo-site.git
    > cd fairfax-oauth2-demo-site

  1.2. Start vagrant

    > vagrant up

  1.3. Connect to the demo site.

Vagrant will run <tt>provision.sh</tt>, which starts the dummy server on port:9000.
The guest VM's port is forwarded to the host machine.

The site provides examples for both the <a href="http://localhost:9000/code_grant.html">Authorization Code Grant</a>
and <a href="http://localhost:9000/implicit_grant.html">Implicit Grant</a> patterns.
