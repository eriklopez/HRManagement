using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Web.Http;
using Microsoft.Owin.Security.OAuth;
using Newtonsoft.Json.Serialization;
using System.Web.Http.Cors;

namespace HRManagement
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            // Web API configuration and services
            // Configure Web API to use only bearer token authentication.
            config.SuppressDefaultHostAuthentication();
            config.Filters.Add(new HostAuthenticationFilter(OAuthDefaults.AuthenticationType));

            //Support for CORS
            EnableCorsAttribute CorsAttribute = new EnableCorsAttribute("*", "*", "GET,POST,PUT,DELETE");
            config.EnableCors(CorsAttribute);

            // Web API routes
            config.MapHttpAttributeRoutes();


            config.Routes.MapHttpRoute(
                name: "Employees",
                routeTemplate: "api/employees/{id}",
                defaults: new { controller = "employees", id = RouteParameter.Optional }
            );

            config.Routes.MapHttpRoute(
                name: "Addresses",
                routeTemplate: "api/addresses/{id}",
                defaults: new { controller = "addresses", id = RouteParameter.Optional }
            );


            config.Routes.MapHttpRoute(
                name: "AddressesFromEmployee",
                routeTemplate: "api/addresses-employee/{empid}",
                defaults: new { controller = "addresses", action = "GetAddressesEmployee" }
            );


            /*config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );*/



            // Solution for JSON & Cyclic problems with EF + CamelCase
            var json = config.Formatters.JsonFormatter;
            json.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();

            json.SerializerSettings.PreserveReferencesHandling =
                Newtonsoft.Json.PreserveReferencesHandling.Objects;


            // Supposed (not working) solution to Cyclic problems with EF & XmlFormatter */
            /*var xml = GlobalConfiguration.Configuration.Formatters.XmlFormatter;
            var dcs = new DataContractSerializer(typeof(Employee), null, int.MaxValue,
                false, preserveObjectReferences: true, null);
            
            xml.SetSerializer<Employee>(dcs);
            var dcs2 = new DataContractSerializer(typeof(Address), null, int.MaxValue,
                false,  true, null);
            xml.SetSerializer<Address>(dcs2);*/

            // The solution that a lot of people recommend : Kill the XmlFormatter
            config.Formatters.Remove(config.Formatters.XmlFormatter);
        }
    }
}
