GitHRManagement
===============

HRManagement App for employees with addresses. WebAPI ASP.NET webservices.  JQuery CRUD application.


So, this is the 'little' project:

> Web Service with ASP.NET WepAPI, EF, SQLServer DB for CRUD operations against Employees (POST, GET, GETALL, PUT, DELETE) and Addresses (POST, GET, GETALL(employee), PUT, DELETE). 

> Web Application Client - Single Page - with jQuery, jQuery UI modals, 2 multipage grids (master-slave) and 2 details panels. To allow full CRUD control of all the entities.

> Both applications are under the same 'project' to avoid some (JSON-JSONP) problems, avoid having 2 active webservers, etc. But as requested, the client doesn't depend on specific web-server technologies, only on data exchange.

> Possible next steps:
a) Finish the Tests Unit project for the ASP.NET part.
b) Polish some javascript, factorize and apply some more design patterns to optimize code.
c) Add more functionalities like: sort columns, batch actions, etc.
d) Continue the research: ExtJS, Backbone.JS, and other frameworks against a webapi rest service.
