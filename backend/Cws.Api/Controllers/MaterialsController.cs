
using Cws.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cws.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MaterialsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public MaterialsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/materials
    [HttpGet]
    public async Task<IActionResult> GetMaterials()
    {
        var materials = await _context.Materials
            .AsNoTracking()
            .OrderBy(m => m.MaterialCode)
            .ThenBy(m => m.Revision)
            .ToListAsync();

        return Ok(materials);
    }

    // GET: api/materials/{materialCode}/{revision}
    [HttpGet("{materialCode}/{revision}")]
    public async Task<IActionResult> GetMaterial(
        string materialCode,
        string revision)
    {
        var material = await _context.Materials
            .AsNoTracking()
            .FirstOrDefaultAsync(m =>
                m.MaterialCode == materialCode &&
                m.Revision == revision);

        if (material == null)
        {
            return NotFound(new
            {
                message = "Material not found."
            });
        }

        return Ok(material);
    }
}
