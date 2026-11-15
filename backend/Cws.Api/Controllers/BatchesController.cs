
using Cws.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cws.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BatchesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public BatchesController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/batches
    [HttpGet]
    public async Task<IActionResult> GetBatches()
    {
        var batches = await _context.Batches
            .AsNoTracking()
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();

        return Ok(batches);
    }

    // GET: api/batches/CW12345678
    [HttpGet("{id}")]
    public async Task<IActionResult> GetBatch(string id)
    {
        var batch = await _context.Batches
            .AsNoTracking()
            .FirstOrDefaultAsync(b => b.BatchId == id);

        if (batch == null)
        {
            return NotFound(new
            {
                message = $"Batch '{id}' was not found."
            });
        }

        return Ok(batch);
    }

    // GET: api/batches/CW12345678/details
    [HttpGet("{id}/details")]
    public async Task<IActionResult> GetBatchDetails(string id)
    {
        var batch = await _context.Batches
            .AsNoTracking()
            .FirstOrDefaultAsync(b => b.BatchId == id);

        if (batch == null)
        {
            return NotFound(new
            {
                message = $"Batch '{id}' was not found."
            });
        }

        var material = await _context.Materials
            .AsNoTracking()
            .FirstOrDefaultAsync(m =>
                m.MaterialCode == batch.MaterialCode &&
                m.Revision == batch.MaterialRevision);

        var parameters = await _context.MaterialParameters
            .AsNoTracking()
            .Where(p =>
                p.MaterialCode == batch.MaterialCode &&
                p.Revision == batch.MaterialRevision)
            .OrderBy(p => p.DisplayOrder)
            .ToListAsync();

        var orders = await _context.Orders
            .AsNoTracking()
            .Where(o => o.BatchId == batch.BatchId)
            .OrderBy(o => o.SequenceNo)
            .ToListAsync();

        return Ok(new
        {
            batch,
            material,
            materialParameters = parameters,
            orders,
            orderCount = orders.Count
        });
    }
}
