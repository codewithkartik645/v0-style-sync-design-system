import { neon } from '@neondatabase/serverless';
import type { ScrapedSite, DesignToken, TokenVersion, TokenMetadata } from './types';

const sql = neon(process.env.DATABASE_URL!);

// Site Operations
export async function createSite(url: string, domain: string, title?: string, faviconUrl?: string): Promise<ScrapedSite> {
  const result = await sql`
    INSERT INTO scraped_sites (url, domain, title, favicon_url)
    VALUES (${url}, ${domain}, ${title || null}, ${faviconUrl || null})
    RETURNING *
  `;
  return result[0] as ScrapedSite;
}

export async function getSiteById(id: string): Promise<ScrapedSite | null> {
  const result = await sql`
    SELECT * FROM scraped_sites WHERE id = ${id}
  `;
  return result[0] as ScrapedSite || null;
}

export async function getSiteByUrl(url: string): Promise<ScrapedSite | null> {
  const result = await sql`
    SELECT * FROM scraped_sites WHERE url = ${url}
  `;
  return result[0] as ScrapedSite || null;
}

export async function getRecentSites(limit = 10): Promise<ScrapedSite[]> {
  const result = await sql`
    SELECT * FROM scraped_sites 
    ORDER BY created_at DESC 
    LIMIT ${limit}
  `;
  return result as ScrapedSite[];
}

export async function updateSite(id: string, updates: Partial<ScrapedSite>): Promise<ScrapedSite> {
  const result = await sql`
    UPDATE scraped_sites 
    SET 
      title = COALESCE(${updates.title || null}, title),
      favicon_url = COALESCE(${updates.favicon_url || null}, favicon_url),
      screenshot_url = COALESCE(${updates.screenshot_url || null}, screenshot_url),
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return result[0] as ScrapedSite;
}

// Token Operations
export async function createToken(
  siteId: string,
  category: 'color' | 'typography' | 'spacing',
  name: string,
  value: string,
  metadata: TokenMetadata = {}
): Promise<DesignToken> {
  const result = await sql`
    INSERT INTO design_tokens (site_id, category, name, value, metadata)
    VALUES (${siteId}, ${category}, ${name}, ${value}, ${JSON.stringify(metadata)})
    RETURNING *
  `;
  return result[0] as DesignToken;
}

export async function createTokensBatch(
  tokens: Array<{
    siteId: string;
    category: 'color' | 'typography' | 'spacing';
    name: string;
    value: string;
    metadata?: TokenMetadata;
  }>
): Promise<DesignToken[]> {
  if (tokens.length === 0) return [];
  
  const results: DesignToken[] = [];
  for (const token of tokens) {
    const result = await createToken(
      token.siteId,
      token.category,
      token.name,
      token.value,
      token.metadata || {}
    );
    results.push(result);
  }
  return results;
}

export async function getTokensBySiteId(siteId: string): Promise<DesignToken[]> {
  const result = await sql`
    SELECT dt.*, 
           CASE WHEN lt.id IS NOT NULL THEN true ELSE false END as is_locked
    FROM design_tokens dt
    LEFT JOIN locked_tokens lt ON dt.id = lt.token_id
    WHERE dt.site_id = ${siteId}
    ORDER BY dt.category, dt.name
  `;
  return result as DesignToken[];
}

export async function getTokenById(id: string): Promise<DesignToken | null> {
  const result = await sql`
    SELECT dt.*, 
           CASE WHEN lt.id IS NOT NULL THEN true ELSE false END as is_locked
    FROM design_tokens dt
    LEFT JOIN locked_tokens lt ON dt.id = lt.token_id
    WHERE dt.id = ${id}
  `;
  return result[0] as DesignToken || null;
}

export async function updateToken(
  id: string,
  value: string,
  metadata?: Partial<TokenMetadata>
): Promise<DesignToken> {
  // Get current token for versioning
  const current = await getTokenById(id);
  if (!current) throw new Error('Token not found');
  
  // Check if locked
  if (current.is_locked) {
    throw new Error('Cannot update locked token');
  }
  
  // Create version record
  await sql`
    INSERT INTO token_versions (token_id, previous_value, new_value, previous_metadata, new_metadata)
    VALUES (
      ${id}, 
      ${current.value}, 
      ${value}, 
      ${JSON.stringify(current.metadata)}, 
      ${JSON.stringify(metadata || current.metadata)}
    )
  `;
  
  // Update token
  const newMetadata = metadata ? { ...current.metadata, ...metadata } : current.metadata;
  const result = await sql`
    UPDATE design_tokens 
    SET value = ${value}, metadata = ${JSON.stringify(newMetadata)}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  
  return result[0] as DesignToken;
}

export async function deleteToken(id: string): Promise<void> {
  await sql`DELETE FROM design_tokens WHERE id = ${id}`;
}

// Lock Operations
export async function lockToken(siteId: string, tokenId: string): Promise<void> {
  await sql`
    INSERT INTO locked_tokens (site_id, token_id)
    VALUES (${siteId}, ${tokenId})
    ON CONFLICT (token_id) DO NOTHING
  `;
}

export async function unlockToken(tokenId: string): Promise<void> {
  await sql`DELETE FROM locked_tokens WHERE token_id = ${tokenId}`;
}

export async function getLockedTokenIds(siteId: string): Promise<string[]> {
  const result = await sql`
    SELECT token_id FROM locked_tokens WHERE site_id = ${siteId}
  `;
  return result.map(r => r.token_id as string);
}

// Version Operations
export async function getTokenVersions(tokenId: string): Promise<TokenVersion[]> {
  const result = await sql`
    SELECT * FROM token_versions 
    WHERE token_id = ${tokenId}
    ORDER BY created_at DESC
  `;
  return result as TokenVersion[];
}

export async function revertToVersion(tokenId: string, versionId: string): Promise<DesignToken> {
  const version = await sql`
    SELECT * FROM token_versions WHERE id = ${versionId} AND token_id = ${tokenId}
  `;
  
  if (!version[0]) throw new Error('Version not found');
  
  const v = version[0] as TokenVersion;
  return updateToken(tokenId, v.previous_value, v.previous_metadata);
}
