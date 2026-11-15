
using Cws.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cws.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MaterialParametersController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public MaterialParametersController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/materialparameters
    [HttpGet]
    public async Task<IActionResult> GetMaterialParameters(
        [FromQuery] string? materialCode,
        [FromQuery] string? revision)
    {
        var query = _context.MaterialParameters.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(materialCode))
        {
            query = query.Where(p => p.MaterialCode == materialCode);
        }

        if (!string.IsNullOrWhiteSpace(revision))
        {
            query = query.Where(p => p.Revision == revision);
        }

        var parameters = await query
            .OrderBy(p => p.DisplayOrder)
            .ToListAsync();

        return Ok(parameters);
    }

    // GET: api/materialparameters/1
    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetMaterialParameter(long id)
    {
        var parameter = await _context.MaterialParameters
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id);

        if (parameter == null)
        {
            return NotFound(new
            {
                message = "Material parameter not found."
            });
        }

        return Ok(parameter);
    }
}
