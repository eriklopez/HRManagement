using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Description;
using HRManagement.Models;
using System.Threading.Tasks;
using System.Web.Http.Routing;
using System.Data.Entity.Core;

namespace HRWSWepAPIORM.Controllers
{
    public class EmployeesController : ApiController
    {
        private EmployeeDBEntities db = new EmployeeDBEntities();


        // GET: api/employees
        private IQueryable<Employee> GetAllEmployees()
        {

            return db.Employees;
        }

        // GET: api/employees?page=1&pageSize=10
        public IQueryable<Employee> Get(int page = 1, int pageSize = 10)
        {
            if ((page <= 0) || (pageSize <= 0)) { 
                return null;
            }

            IQueryable<Employee> query;

            query = GetAllEmployees().OrderBy(e => e.EmpLastName);
            int totalCount=0, totalPages=1;
            

            try {
                totalCount = query.Count();
                totalPages = ((int)Math.Ceiling((double)totalCount / pageSize));
            }
            catch (EntityException e)
            {
                return query;
            } 

            var paginationHeader = new
            {
                totalCount = totalCount,
                totalPages = totalPages,
                actualPage = page,
                pageSize = pageSize
            };

            System.Web.HttpContext.Current.Response.Headers.Add("X-Pagination",
            Newtonsoft.Json.JsonConvert.SerializeObject(paginationHeader));

            var results = query
            .Skip(pageSize * (page-1))
            .Take(pageSize);

            return results; 

            /* This mode is hard to configure with ExtJS, 
             * it doesn't recognize the "data" property because 
             * of the double quotation marks in the property name
             
            var results = query.Skip(pageSize * (page-1)).Take(pageSize);
            return new
            {
                totalCount = totalCount,
                totalPages = totalPages,
                prevPageLink = prevLink,
                nextPagelink = nextLink,
                data = results
            };
             */

        }
        
        // GET: api/employees/5
        [ResponseType(typeof(Employee))]
        public async Task<IHttpActionResult> GetEmployee(int id)
        {
            Employee employee = await db.Employees.FindAsync(id);
            if (employee == null)
            {
                return NotFound();
            }

            return Ok(employee);
        }

        // PUT: api/employees/5
        [ResponseType(typeof(void))]
        public async Task<IHttpActionResult> PutEmployee(int id, Employee employee)
        {


            if (id != employee.EmpID)
            {
                return BadRequest();
            }

            if (!EmployeeExists(id))
            {
                return NotFound();
            }

            db.Entry(employee).State = EntityState.Modified;

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EmployeeExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return StatusCode(HttpStatusCode.NoContent);
        }

        // POST: api/employees
        [ResponseType(typeof(Employee))]
        public async Task<IHttpActionResult> PostEmployee(Employee employee)
        {


            if (EmployeeExists(employee.EmpID))
            {
                return Conflict();
            }

            db.Employees.Add(employee);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (EmployeeExists(employee.EmpID))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtRoute("Employees", new { id = employee.EmpID }, employee);
        }

        // DELETE: api/employees/5
        [ResponseType(typeof(Employee))]
        public async Task<IHttpActionResult> DeleteEmployee(int id)
        {
            Employee employee = await db.Employees.FindAsync(id);
            if (employee == null)
            {
                return NotFound();
            }

            db.Employees.Remove(employee);
            await db.SaveChangesAsync();

            return Ok(employee);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool EmployeeExists(int id)
        {
            return db.Employees.Count(e => e.EmpID == id) > 0;
        }
    }
}