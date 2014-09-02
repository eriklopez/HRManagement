using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using HRManagement.Models;
using System.Data.Entity.Core;

namespace HRWSWepAPIORM.Controllers
{
    public class AddressesController : ApiController
    {
        private EmployeeDBEntities db = new EmployeeDBEntities();

        

        // GET: api/addresses
        private IQueryable<Address> GetAddresses()
        {
            return db.Addresses;
        }


        // GET: api/addresses/5
        [ResponseType(typeof(Address))]
        public async Task<IHttpActionResult> GetAddress(int id)
        {
            Address address = await db.Addresses.FindAsync(id);
            if (address == null)
            {
                return NotFound();
            }

            return Ok(address);
        }


        // GET: api/addresses-employee/5
        public IQueryable<Address> GetAddressesEmployee(int empid, int page = 1, int pageSize = 5)
        {
            IQueryable<Address> query;

            query = db.Addresses.Where(a => a.EmpID == empid).OrderBy(b => b.AddStreet);
            int totalCount = 0, totalPages = 1;

            try
            {
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
            .Skip(pageSize * (page - 1))
            .Take(pageSize);

            return results;
        }

        // PUT: api/addresses/5
        [ResponseType(typeof(void))]
        public async Task<IHttpActionResult> PutAddress(int id, Address address)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != address.AddID)
            {
                return BadRequest();
            }

            db.Entry(address).State = EntityState.Modified;

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AddressExists(id))
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

        // POST: api/addresses
        [ResponseType(typeof(Address))]
        public async Task<IHttpActionResult> PostAddress(Address address)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.Addresses.Add(address);
            await db.SaveChangesAsync();

            return CreatedAtRoute("Addresses", new { id = address.AddID }, address);
        }

        // DELETE: api/addresses/5
        [ResponseType(typeof(Address))]
        public async Task<IHttpActionResult> DeleteAddress(int id)
        {
            Address address = await db.Addresses.FindAsync(id);
            if (address == null)
            {
                return NotFound();
            }

            db.Addresses.Remove(address);
            await db.SaveChangesAsync();

            return Ok(address);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool AddressExists(int id)
        {
            return db.Addresses.Count(e => e.AddID == id) > 0;
        }
    }
}